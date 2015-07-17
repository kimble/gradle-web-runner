package com.developerb.gviz.events;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Date;

/**
 * @author Kim A. Betti
 */
public class TestStarted extends TestEvent {

    private final String projectName;
    private final String projectPath;

    @JsonCreator
    public TestStarted(@JsonProperty("timestamp") Date timestamp,
                       @JsonProperty("className") String className,
                       @JsonProperty("name") String name,
                       @JsonProperty("projectPath") String projectPath,
                       @JsonProperty("projectName") String projectName) {

        super(timestamp, className, name);

        this.projectName = projectName;
        this.projectPath = projectPath;
    }

    public String getProjectName() {
        return projectName;
    }

    public String getProjectPath() {
        return projectPath;
    }

    @Override
    protected String describeTestEvent() {
        return "Starting test in project " + projectPath;
    }

}
