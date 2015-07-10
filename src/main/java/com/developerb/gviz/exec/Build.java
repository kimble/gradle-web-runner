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
        if (line.contains("I'll be hanging around waiting for the g-viz to connect..")) {
            connectToSpyWithinBuild();
        }

        Date timestamp = new Date();
        OutputWrittenFromGradle event = new OutputWrittenFromGradle(timestamp, line);

        eventStore.push(event);
    }

    private void connectToSpyWithinBuild() {
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
                            final JsonNode json = jackson.readTree(userInput);
                            final String type = json.get("type").asText();

                            switch (type) {
                                case "settings-ready":
                                    handleEvent(json, SettingsReady.class);
                                    break;

                                case "task-graph-ready":
                                    handleEvent(json, TaskGraphReady.class);
                                    break;

                                case "task-before":
                                    handleEvent(json, TaskStarting.class);
                                    break;

                                case "task-after":
                                    handleEvent(json, TaskCompleted.class);
                                    break;

                                case "build-completed":
                                    handleEvent(json, GradleBuildCompleted.class);
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

    private void handleEvent(JsonNode json, Class<? extends Event> eventType) throws com.fasterxml.jackson.core.JsonProcessingException {
        Event event = jackson.treeToValue(json.path("event"), eventType);
        log.info("Event: {}", event);

        eventStore.push(event);
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
