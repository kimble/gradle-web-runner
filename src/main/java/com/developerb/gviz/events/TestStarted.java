package com.developerb.gviz.events;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Date;

/**
 * @author Kim A. Betti
 */
public class TestStarted extends TestEvent {

    @JsonCreator
    public TestStarted(@JsonProperty("timestamp") Date timestamp,
                       @JsonProperty("className") String className,
                       @JsonProperty("name") String name) {

        super(timestamp, className, name);
    }

    @Override
    protected String describeTestEvent() {
        return "Starting";
    }

}
