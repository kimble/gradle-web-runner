package com.developerb.gviz.events;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Date;

/**
 * @author Kim A. Betti
 */
public class TaskStarting extends TaskEvent {

    @JsonCreator
    public TaskStarting(@JsonProperty("path") String path,
                        @JsonProperty("timestamp") Date timestamp,
                        @JsonProperty("projectPath") String projectPath) {

        super(timestamp, path, projectPath);
    }

    @Override
    protected String describeTaskEvent() {
        return "Starting";
    }

}
