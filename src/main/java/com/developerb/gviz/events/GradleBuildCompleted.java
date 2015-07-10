package com.developerb.gviz.events;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Date;

/**
 * @author Kim A. Betti
 */
public class GradleBuildCompleted extends Event {

    private final String failureMessage;
    private final Date timestamp;

    @JsonCreator
    public GradleBuildCompleted(@JsonProperty("failureMessage") String failureMessage,
                                @JsonProperty("timestamp") Date timestamp) {

        this.failureMessage = failureMessage;
        this.timestamp = timestamp;
    }

    public String getFailureMessage() {
        return failureMessage;
    }

    public Date getTimestamp() {
        return timestamp;
    }

    @Override
    protected String describe() {
        return "Gradle build completed." + (failureMessage != null ? "Failure message: " + failureMessage : "No failure message");
    }

}
