package com.developerb.gviz.events;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * @author Kim A. Betti
 */
public class TestStarted extends TestEvent {

    @JsonCreator
    public TestStarted(@JsonProperty("className") String className, @JsonProperty("name") String name) {
        super(className, name);
    }

    @Override
    protected String describeTestEvent() {
        return "Starting";
    }

}
