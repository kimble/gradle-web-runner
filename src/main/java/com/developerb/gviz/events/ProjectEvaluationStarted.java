package com.developerb.gviz.events;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * @author Kim A. Betti
 */
public class ProjectEvaluationStarted extends ProjectEvent {

    private final String name;
    private final String description;

    @JsonCreator
    public ProjectEvaluationStarted(@JsonProperty("path") String projectPath,
                                       @JsonProperty("name") String name,
                                       @JsonProperty("description") String description) {
        super(projectPath);
        this.name = name;
        this.description = description;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    @Override
    protected String describe() {
        return "Evaluation project " + name + " [" + path + "]";
    }

}
