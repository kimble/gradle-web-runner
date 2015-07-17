package com.developerb.gviz.events;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.base.Joiner;

import java.util.Set;

/**
 * @author Kim A. Betti
 */
public class ProjectEvaluated extends ProjectEvent {

    private final String name;
    private final String description;

    private final String parentPath;
    private final Set<String> childrenPaths;

    @JsonCreator
    public ProjectEvaluated(@JsonProperty("path") String projectPath,
                            @JsonProperty("name") String name,
                            @JsonProperty("description") String description,
                            @JsonProperty("parent") String parentPath,
                            @JsonProperty("children") Set<String> childrenPaths) {
        super(projectPath);

        this.name = name;
        this.description = description;
        this.parentPath = parentPath;
        this.childrenPaths = childrenPaths;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public String getParentPath() {
        return parentPath;
    }

    public Set<String> getChildrenPaths() {
        return childrenPaths;
    }

    @Override
    protected String describe() {
        return "Evaluated project " + name + "[" + path + "], child of: " + parentPath + ", children: " + Joiner.on(", ").join(childrenPaths);
    }

}