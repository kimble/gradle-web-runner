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
import java.util.List;
import java.util.Optional;

/**
 * @author Kim A. Betti
 */
public class Build implements Comparable<Build> {

    private final Logger log;

    private final Integer buildNumber;
    private final GradleForker gradleForker;
    private final ObjectMapper jackson;

    private final EventStore eventStore = new EventStore();
    private final BuildStatistics statistics = new BuildStatistics();

    private volatile BuildContext buildContext;


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
                                    TaskCompleted taskCompleted = handleEvent(json, TaskCompleted.class);
                                    statistics.reportDuration(taskCompleted.getPath(), taskCompleted.getDurationMillis());
                                    break;

                                case "before-test":
                                    handleEvent(json, TestStarted.class);
                                    break;

                                case "after-test":
                                    TestCompleted testCompleted = handleEvent(json, TestCompleted.class);
                                    statistics.reportDuration(testCompleted.key(), testCompleted.getDurationMillis());
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

    private <T extends Event> T handleEvent(JsonNode json, Class<T> eventType) throws com.fasterxml.jackson.core.JsonProcessingException {
        T event = jackson.treeToValue(json.path("event"), eventType);
        log.info("Event: {}", event);

        eventStore.push(event);
        return event;
    }

    public void onUnknownFailure(String message, Exception ex) {
        log.error(message, ex);

        Event event = new UnknownErrorOccurred(ex);
        eventStore.push(event);
    }

    public void execute(File directory, String tasks) {
        gradleForker.execute(this, directory, tasks);
    }

    public void onGradleProcessForked(File directory, List<String> command) {
        GradleProcessForked event = new GradleProcessForked(directory, command);
        buildContext = new BuildContext(event.getPath(), event.getCommandLine());
        eventStore.push(event);
    }

    public void onCompletion(int exitValue) {
        Event completionEvent = new BuildCompleted(exitValue);
        eventStore.push(completionEvent);
    }

    public Integer getBuildNumber() {
        return buildNumber;
    }

    public Optional<BuildContext> getBuildContext() {
        return Optional.of(buildContext);
    }

    public BuildStatistics getStatistics() {
        return statistics;
    }

    public boolean hasMatchingContext(BuildContext other) {
        return buildContext != null && buildContext.equals(other);
    }

    @Override
    public String toString() {
        return "Build #" + buildNumber + " -- " + (buildContext != null ? buildContext : "Not forked yet");
    }

    public EventStore getEventStore() {
        return eventStore;
    }

    @Override
    public int compareTo(Build o) {
        return buildNumber - o.buildNumber;
    }

}
