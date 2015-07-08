package com.developerb.gviz.exec;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Charsets;
import com.google.common.collect.EvictingQueue;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.io.CharSource;
import com.google.common.io.Files;
import com.google.common.io.Resources;
import io.dropwizard.views.View;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.zeroturnaround.exec.ProcessExecutor;
import org.zeroturnaround.exec.ProcessResult;
import org.zeroturnaround.exec.stream.LogOutputStream;

import javax.ws.rs.*;
import javax.ws.rs.core.Response;
import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.Socket;
import java.net.URL;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

import static com.google.common.base.Charsets.UTF_8;
import static javax.ws.rs.core.MediaType.APPLICATION_JSON;
import static javax.ws.rs.core.MediaType.valueOf;
import static javax.ws.rs.core.Response.Status.NOT_FOUND;


@Path("/api")
public class ExecResource {

    private final static Logger log = LoggerFactory.getLogger(ExecResource.class);


    private final AtomicInteger buildNumber = new AtomicInteger(0);
    private final ConcurrentMap<Integer, Build> builds = Maps.newConcurrentMap();


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
    @Path("exec")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    public Response exec(ExecRequest request) {
        Integer buildNumber = this.buildNumber.incrementAndGet();
        Build build = new Build(gradleInitScript, objectMapper, buildNumber);
        builds.put(buildNumber, build);

        new Thread(() -> build.execute(request.directory(), request.tasks)).start();

        return Response.ok()
                .entity(ImmutableMap.of("number", buildNumber))
                .build();
    }

    @GET
    @Path("build/{nr}")
    @Produces("text/html")
    public Response viewBuild(@PathParam("nr") Integer nr) {
        if (builds.containsKey(nr)) {
            Build build = builds.get(nr);
            BuildView view = new BuildView(build);

            return Response.ok()
                    .entity(view)
                    .build();
        }
        else {
            return Response.status(NOT_FOUND)
                    .entity("No such build: " + nr)
                    .build();
        }
    }

    @GET
    @Path("build/{nr}/state")
    @Produces(APPLICATION_JSON)
    public Response viewBuildState(@PathParam("nr") Integer nr) {
        if (builds.containsKey(nr)) {
            return Response.ok()
                    .entity(builds.get(nr).state)
                    .build();
        }
        else {
            return Response.status(NOT_FOUND)
                    .entity("No such build: " + nr)
                    .build();
        }
    }


    public static class ExecRequest {

        public String path;
        public String tasks;

        public File directory() {
            return new File(path);
        }

    }


    public static class Build {

        private final Logger log;

        private final int number;
        private final File gradleInitScript;
        private final ObjectMapper objectMapper;

        private final BuildState state = new BuildState();

        public Build(File gradleInitScript, ObjectMapper objectMapper, int number) {
            this.objectMapper = objectMapper;
            this.log = LoggerFactory.getLogger("build-" + number);
            this.gradleInitScript = gradleInitScript;
            this.number = number;
        }



        public void execute(File directory, String tasks) {
            try {
                ProcessExecutor executor = new ProcessExecutor()
                        .directory(directory)
                        .environment("GRADLE_USER_HOME", "/tmp")
                        .environment("SPY_PORT", "10000")
                        .command("./gradlew", "--stacktrace", "--no-daemon", "--init-script", gradleInitScript.getAbsolutePath(), tasks)
                        .readOutput(true)
                        .exitValues(0);

                executor.redirectOutput(new LogOutputStream() {

                    @Override
                    protected void processLine(String line) {
                        System.out.println(" --- " + line);

                        state.onLine(line);

                        if (line.contains("I'll be hanging around waiting for the g-viz to connect..")) {
                            log.info("Kicking off thread to listen for socket messages");
                            new Thread(Build.this::listen).start();
                        }
                    }

                });




                ProcessResult result = executor.executeNoTimeout();

                completed(result);
            }
            catch (Exception ex) {
                log.error("Failure", ex);
            }
        }

        private void completed(ProcessResult result) {
            log.info("EXIT CODE: {}", result.getExitValue());
            state.exitCode = result.getExitValue();
        }

        @SuppressWarnings("unchecked")
        private void listen() {
            log.info("Attempting to connect to spy script");

            try {
                try (Socket socket = new Socket("localhost", 10_000)) {
                    log.info("Connected to spy running inside build");

                    try (InputStreamReader reader = new InputStreamReader(socket.getInputStream())) {
                        try (BufferedReader in = new BufferedReader(reader)) {
                            String userInput;
                            while ((userInput = in.readLine()) != null) {
                                System.out.println(" >> " + userInput);
                                Map<String, Object> message = objectMapper.readValue(userInput, Map.class);

                                onMessage (
                                        (String) message.get("message"),
                                        message.get("payload")
                                );
                            }
                        }
                    }
                }
            }
            catch (Exception ex) {
                log.error("failure..", ex);
                state.exitCode = -1;
            }
        }

        @SuppressWarnings("unchecked")
        public void onMessage(String message, Object payload) {

            switch (message) {
                case "project-name":
                    state.projectName = (String) payload;
                    break;

                case "max-worker-count":
                    state.maxWorkerCount = (Integer) payload;
                    break;

                case "task-list":
                    state.tasks = ((List<Map<String, Object>>) payload)
                            .stream()
                            .map(input -> new TaskState((String) input.get("name"), (String) input.get("description"), (String) input.get("path"), (List<String>) input.get("dependsOn")))
                            .collect(Collectors.toList());
                    break;

                case "before-task":
                    MapPayload wrapper = new MapPayload(payload);
                    TaskState task = state.test(wrapper.str("path"));
                    task.started(new Date(wrapper.lng("started")));
                    break;

                case "after-task":
                    MapPayload after = new MapPayload(payload);
                    TaskState afterTask = state.test(after.str("path"));
                    afterTask.finished(after.lng("duration"));
                    break;

                case "before-test":
                    MapPayload beforeTestPayload = new MapPayload(payload);
                    state.tests.add(new TestState(beforeTestPayload.str("className"), beforeTestPayload.str("name")));
                    break;

                case "after-test":
                    MapPayload afterTestPayload = new MapPayload(payload);
                    TestState test = state.test(afterTestPayload.str("className"), afterTestPayload.str("name"));
                    test.finished(afterTestPayload.str("result"), afterTestPayload.lng("duration"));
                    break;

                default:
                    log.warn("Unprocessed message {}: {}", message, payload);
            }
        }

    }

    @SuppressWarnings("unchecked")
    static class MapPayload {

        private final Map<String, Object> payload;

        MapPayload(Object payload) {
            this.payload = (Map<String, Object>) payload;
        }

        String str(String key) {
            return (String) payload.get(key);
        }

        Long lng(String key) {
            if (payload.get(key) instanceof Integer) {
                return ((Integer) payload.get(key)).longValue();
            }
            else {
                return (Long) payload.get(key);
            }
        }

    }

    public static class BuildState {

        private final EvictingQueue<String> consoleBuffer = EvictingQueue.create(20);

        @JsonProperty String projectName;
        @JsonProperty Integer maxWorkerCount;
        @JsonProperty List<TaskState> tasks = Lists.newArrayList();
        @JsonProperty List<TestState> tests = Lists.newArrayList();

        @JsonProperty Integer exitCode;

        @JsonProperty
        public String getConsoleBuffer() {
            StringBuilder buffer = new StringBuilder();
            consoleBuffer.stream().forEach(s -> buffer.append(s).append("\n"));
            return buffer.toString();
        }

        public TaskState test(String path) {
            return tasks.stream()
                    .filter(taskState -> path.equals(taskState.path))
                    .findFirst()
                    .get();
        }

        public TestState test(String className, String name) {
            return tests.stream()
                    .filter(test -> className.equals(test.className) && name.equals(test.name))
                    .findFirst()
                    .get();
        }

        public void onLine(String line) {
            consoleBuffer.add(line);
        }
    }

    public static class TaskState {

        @JsonProperty String name;
        @JsonProperty String description;
        @JsonProperty String path;
        @JsonProperty List<String> dependsOn;

        @JsonProperty Date started;
        @JsonProperty Long duration;

        public TaskState(String name, String description, String path, List<String> dependsOn) {
            this.description = description;
            this.dependsOn = dependsOn;
            this.name = name;
            this.path = path;
        }

        void started(Date started) {
            this.started = started;
        }

        public void finished(Long duration) {
            this.duration = duration;
        }

    }

    public static class TestState {

        @JsonProperty String name;
        @JsonProperty String className;
        @JsonProperty String result;
        @JsonProperty Long duration;

        public TestState(String className, String name) {
            this.className = className;
            this.name = name;
        }

        void finished(String result, Long duration) {
            this.result = result;
            this.duration = duration;
        }

    }


    public static class BuildView extends View {

        private final Build build;

        public BuildView(Build build) {
            super("/templates/build.ftl", Charsets.UTF_8);
            this.build = build;
        }

        public Integer getBuildNumber() {
            return build.number;
        }

    }

}
