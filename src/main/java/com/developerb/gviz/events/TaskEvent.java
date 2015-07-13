package com.developerb.gviz.events;

import java.util.Date;

/**
 * @author Kim A. Betti
 */
public abstract class TaskEvent extends Event {

    private final String path;

    protected TaskEvent(Date timestamp, String path) {
        super(timestamp);
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
