package com.developerb.gviz.events;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Date;

/**
 * @author Kim A. Betti
 */
public class TaskStarting extends Event {

    private final String path;
    private final Date timestamp;

    @JsonCreator
    public TaskStarting(@JsonProperty("path") String path, @JsonProperty("timestamp") Date timestamp) {
        this.path = path;
        this.timestamp = timestamp;
    }

    public String getPath() {
        return path;
    }

    public Date getTimestamp() {
        return timestamp;
    }

}
