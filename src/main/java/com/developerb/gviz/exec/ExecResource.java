package com.developerb.gviz.exec;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.deser.BuilderBasedDeserializer;
import com.google.common.io.CharSource;
import com.google.common.io.Files;
import com.google.common.io.Resources;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.zeroturnaround.exec.ProcessExecutor;
import org.zeroturnaround.exec.ProcessResult;
import org.zeroturnaround.exec.stream.LogOutputStream;

import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.Socket;
import java.net.URL;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

import static com.google.common.base.Charsets.UTF_8;


@Path("/exec")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class ExecResource {

    private final static Logger log = LoggerFactory.getLogger(ExecResource.class);


    private final AtomicInteger buildNumber = new AtomicInteger(0);


    private final File gradleInitScript;
    private final ObjectMapper objectMapper;

    public ExecResource(ObjectMapper objectMapper) throws IOException {
        this.objectMapper = objectMapper;
        gradleInitScript = writeScriptToTemporaryDirectory();
    }

    private File writeScriptToTemporaryDirectory() throws IOException {
        File gradleInitScript;URL resource = Resources.getResource("gradle/gradle-spy.gradle");
        CharSource scriptCharSource = Resources.asCharSource(resource, UTF_8);

        File directory = Files.createTempDir();
        gradleInitScript = new File(directory, "g-viz.gradle");

        Files.write(scriptCharSource.read(), gradleInitScript, UTF_8);

        return gradleInitScript;
    }

    @POST
    public Response exec(ExecRequest request) throws Exception {
        Build build = new Build(buildNumber.incrementAndGet());

        ProcessExecutor executor = new ProcessExecutor()
                .directory(request.directory())
                .environment("SPY_PORT", "10000")
                .command("./gradlew", "--stacktrace", "--no-daemon", "--init-script", gradleInitScript.getAbsolutePath(), request.tasks)
                .readOutput(true)
                .exitValues(0);

        executor.redirectOutput(new LogOutputStream() {

            @Override
            protected void processLine(String line) {
                System.out.println(" --- " + line);

                if (line.contains("I'll be hanging around waiting for the g-viz to connect..")) {
                    listen(build);
                }
            }

        });


        ProcessResult result = executor.executeNoTimeout();


        return Response.ok()
                .entity("Exit: " + result.getExitValue())
                .build();
    }

    @SuppressWarnings("unchecked")
    private void listen(Build build) {
        log.info("Attempting to connect to spy script");

        try {
            try (Socket socket = new Socket("localhost", 10_000)) {
                try (InputStreamReader reader = new InputStreamReader(socket.getInputStream())) {
                    try (BufferedReader in = new BufferedReader(reader)) {
                        String userInput;
                        while ((userInput = in.readLine()) != null) {
                            //System.out.println(" >> " + userInput);

                            Map<String, Object> message = objectMapper.readValue(userInput, Map.class);
                            build.onMessage((String) message.get("message"), message.get("payload"));
                        }
                    }
                }
            }
        }
        catch (Exception ex) {
            log.error("failure..", ex);
        }
    }


    public static class ExecRequest {

        public String path;
        public String tasks;

        public File directory() {
            return new File(path);
        }

    }


    static class Build {

        private final Logger log;

        private final int number;

        public Build(int number) {
            this.log = LoggerFactory.getLogger("build-" + number);
            this.number = number;
        }

        public void onMessage(String message, Object payload) {
            log.info("GOT MESSAGE: " + message + " :: " + payload);
        }

    }

}
