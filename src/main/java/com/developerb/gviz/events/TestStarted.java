package com.developerb.gviz.events;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Date;

/**
 * A test has started executing.
 * We know which project and task this test belongs to.
 *
 * @author Kim A. Betti
 */
public class TestStarted extends TestEvent {

    private final String taskPath;
    private final String projectPath;

    @JsonCreator
    public TestStarted(@JsonProperty("timestamp") Date timestamp,
                       @JsonProperty("className") String className,
                       @JsonProperty("name") String name,
                       @JsonProperty("projectPath") String projectPath,
                       @JsonProperty("taskPath") String taskPath) {

        super(timestamp, className, name);

        this.taskPath = taskPath;
        this.projectPath = projectPath;
    }

    public String getTaskPath() {
        return taskPath;
    }

    public String getProjectPath() {
        return projectPath;
    }

    @Override
    protected String describeTestEvent() {
        return "Starting test in project " + projectPath;
    }

}
