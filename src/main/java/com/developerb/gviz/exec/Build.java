package com.developerb.gviz.exec;

import com.developerb.gviz.events.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.net.Socket;
import java.util.Date;

/**
 * @author Kim A. Betti
 */
public class Build {

    private final Logger log;

    private final Integer buildNumber;
    private final GradleForker gradleForker;
    private final ObjectMapper jackson;
    private final EventStore eventStore = new EventStore();

    public Build(Integer buildNumber, GradleForker gradleForker, ObjectMapper jackson) {
        this.log  = LoggerFactory.getLogger("build-" + buildNumber);
        this.gradleForker = gradleForker;
        this.jackson = jackson;
        this.buildNumber = buildNumber;
    }


    public void onConsoleOutput(String line) {
        log.info(" >> {}", line);

        if (line.contains("I'll be hanging around waiting for the g-viz to connect..")) {
            connectoToSpyWithinBuild();
        }

        Date timestamp = new Date();
        OutputWrittenFromGradle event = new OutputWrittenFromGradle(timestamp, line);

        eventStore.push(event);
    }

    private void connectoToSpyWithinBuild() {
        log.info("Kicking off thread to listen for socket messages");
        new Thread(Build.this::listen).start();
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
                            log.info(" >> {}", userInput);

                            final JsonNode json = jackson.readTree(userInput);
                            final String type = json.get("type").asText();

                            switch (type) {
                                case "settings-ready":
                                    Event settingsEvent = jackson.treeToValue(json.path("event"), SettingsReady.class);
                                    eventStore.push(settingsEvent);
                                    break;

                                default:
                                    log.warn("Received message of unknown type: {}", type);
                            }
                        }
                    }
                }
            }
        }
        catch (Exception ex) {
            onUnknownFailure("Failed to connect to the spy running within build", ex);
        }
    }

    public void onUnknownFailure(String message, Exception ex) {
        log.error(message, ex);

        Event event = new UnknownErrorOccurred(ex);
        eventStore.push(event);
    }

    public void execute(File directory, String tasks) {
        gradleForker.execute(this, directory, tasks);
    }

    public void onCompletion(int exitValue) {
        Event completionEvent = new BuildCompleted(exitValue);
        eventStore.push(completionEvent);
    }

    public Integer getBuildNumber() {
        return buildNumber;
    }

    @Override
    public String toString() {
        return "Build #" + buildNumber;
    }

    public EventStore getEventStore() {
        return eventStore;
    }
}
