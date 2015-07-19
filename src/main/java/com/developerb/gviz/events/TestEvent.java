package com.developerb.gviz.events;

import java.util.Date;

/**
 * @author Kim A. Betti
 */
public abstract class TestEvent extends Event {

    private final String taskPath;
    private final String className;
    private final String name;

    protected TestEvent(Date timestamp, String taskPath, String className, String name) {
        super(timestamp);

        this.taskPath = taskPath;
        this.className = className;
        this.name = name;
    }

    public String getTaskPath() {
        return taskPath;
    }

    public String getClassName() {
        return className;
    }

    public String getName() {
        return name;
    }

    public String key() {
        return String.format("%s/%s", className, name);
    }

    @Override
    protected final String describe() {
        return String.format("Test: %s / %s: %s", className, name, describeTestEvent());
    }

    protected abstract String describeTestEvent();

}
