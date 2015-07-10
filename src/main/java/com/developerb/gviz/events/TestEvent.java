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

    @Override
    protected final String describe() {
        return className + " / " + name + ": " + describeTestEvent();
    }

    protected abstract String describeTestEvent();

}
