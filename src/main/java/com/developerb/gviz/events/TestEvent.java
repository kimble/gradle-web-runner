package com.developerb.gviz.events;

/**
 * @author Kim A. Betti
 */
public abstract class TestEvent extends Event {

    private final String className;
    private final String name;

    protected TestEvent(String className, String name) {
        this.className = className;
        this.name = name;
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
