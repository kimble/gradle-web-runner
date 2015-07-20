package com.developerb.gviz.events;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Date;

/**
 * @author Kim A. Betti
 */
public class TaskCompleted extends TaskEvent {

    private final boolean didWork;
    private final boolean executed;
    private final boolean skipped;
    private final String skippedMessage;
    private final String failureMessage;
    private final String failureStacktrace;
    private final Integer durationMillis;
    private final String output;


    @JsonCreator
    public TaskCompleted(@JsonProperty("path") String path,
                         @JsonProperty("projectPath") String projectPath,
                         @JsonProperty("timestamp") Date timestamp,
                         @JsonProperty("didWork") boolean didWork,
                         @JsonProperty("executed") boolean executed,
                         @JsonProperty("skipped") boolean skipped,
                         @JsonProperty("skippedMessage") String skippedMessage,
                         @JsonProperty("failureMessage") String failureMessage,
                         @JsonProperty("failureStacktrace") String failureStacktrace,
                         @JsonProperty("durationMillis") Integer durationMillis,
                         @JsonProperty("output") String output) {

        super(timestamp, path, projectPath);

        this.didWork = didWork;
        this.executed = executed;
        this.skipped = skipped;
        this.skippedMessage = skippedMessage;
        this.failureMessage = failureMessage;
        this.failureStacktrace = failureStacktrace;
        this.durationMillis = durationMillis;
        this.output = output;
    }

    public boolean isDidWork() {
        return didWork;
    }

    public boolean isSuccess() {
        return !skipped && executed && !isFailure();
    }

    public boolean isFailure() {
        return failureMessage != null;
    }

    public boolean isExecuted() {
        return executed;
    }

    public boolean isSkipped() {
        return skipped;
    }

    public String getSkippedMessage() {
        return skippedMessage;
    }

    public String getFailureMessage() {
        return failureMessage;
    }

    public String getFailureStacktrace() {
        return failureStacktrace;
    }

    public Integer getDurationMillis() {
        return durationMillis;
    }

    public String getOutput() {
        return output;
    }

    @Override
    protected String describeTaskEvent() {
        return "Completed after " + durationMillis + " milliseconds";
    }

}
