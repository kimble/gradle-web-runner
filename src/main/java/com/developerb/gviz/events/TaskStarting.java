package com.developerb.gviz.events;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Date;

/**
 * @author Kim A. Betti
 */
public class TaskStarting extends TaskEvent {

    private final String projectPath;

    @JsonCreator
    public TaskStarting(@JsonProperty("path") String path,
                        @JsonProperty("timestamp") Date timestamp,
                        @JsonProperty("projectPath") String projectPath) {
        super(timestamp, path);

        this.projectPath = projectPath;
    }

    public String getProjectPath() {
        return projectPath;
    }

    @Override
    protected String describeTaskEvent() {
        return "Starting";
    }

}
