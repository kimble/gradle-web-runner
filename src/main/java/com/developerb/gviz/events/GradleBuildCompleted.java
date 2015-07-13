package com.developerb.gviz.events;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Date;

/**
 * Triggered by "buildFinished"
 *
 * @author Kim A. Betti
 */
public class GradleBuildCompleted extends Event {

    private final String failureMessage;
    private final long durationMillis;

    @JsonCreator
    public GradleBuildCompleted(@JsonProperty("failureMessage") String failureMessage,
                                @JsonProperty("timestamp") Date timestamp,
                                @JsonProperty("durationMillis") long durationMillis) {

        super(timestamp);
        this.failureMessage = failureMessage;
        this.durationMillis = durationMillis;
    }

    public String getFailureMessage() {
        return failureMessage;
    }

    public long getDurationMillis() {
        return durationMillis;
    }

    @Override
    protected String describe() {
        return String.format("Gradle build completed after %d milliseconds. %s", durationMillis, failureMessage != null ? "Failure message: " + failureMessage : "No failure message");
    }

}
