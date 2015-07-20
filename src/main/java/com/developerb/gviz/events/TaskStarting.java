package com.developerb.gviz.events;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Date;

/**
 * @author Kim A. Betti
 */
public class TaskStarting extends TaskEvent {

    private final String threadName;

    @JsonCreator
    public TaskStarting(@JsonProperty("path") String path,
                        @JsonProperty("timestamp") Date timestamp,
                        @JsonProperty("projectPath") String projectPath,
                        @JsonProperty("threadName") String threadName) {

        super(timestamp, path, projectPath);

        this.threadName = threadName;
    }

    public String getThreadName() {
        return threadName;
    }

    @Override
    protected String describeTaskEvent() {
        return String.format("Starting in thread '%s'", threadName);
    }

}
