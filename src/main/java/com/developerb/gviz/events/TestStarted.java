package com.developerb.gviz.events;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * @author Kim A. Betti
 */
public class TestStarted {

    private final String className;
    private final String name;

    @JsonCreator
    public TestStarted(@JsonProperty("className") String className, @JsonProperty("name") String name) {
        this.className = className;
        this.name = name;
    }

    public String getClassName() {
        return className;
    }

    public String getName() {
        return name;
    }

    @Override
    public String toString() {
        return String.format("Starting test %s : %s", className, name);
    }

}
