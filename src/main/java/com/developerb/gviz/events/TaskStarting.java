package com.developerb.gviz.events;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Date;

/**
 * @author Kim A. Betti
 */
public class TaskStarting extends TaskEvent {

    private final Date timestamp;

    @JsonCreator
    public TaskStarting(@JsonProperty("path") String path, @JsonProperty("timestamp") Date timestamp) {
        super(path);
        this.timestamp = timestamp;
    }

    public Date getTimestamp() {
        return timestamp;
    }

    @Override
    protected String describeTaskEvent() {
        return "Starting";
    }

}
