package com.developerb.gviz.events;

/**
 * @author Kim A. Betti
 */
public abstract class TaskEvent extends Event {

    private final String path;

    protected TaskEvent(String path) {
        this.path = path;
    }

    public String getPath() {
        return path;
    }

    @Override
    protected final String describe() {
        return "Task: " + path + ": " + describeTaskEvent();
    }

    protected abstract String describeTaskEvent();

}
