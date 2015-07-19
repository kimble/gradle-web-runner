package com.developerb.gviz.events;

import java.util.Date;

/**
 * @author Kim A. Betti
 */
public abstract class TaskEvent extends Event {

    private final String path;
    private final String projectPath;

    protected TaskEvent(Date timestamp, String path, String projectPath) {
        super(timestamp);
        this.path = path;
        this.projectPath = projectPath;
    }

    public String getPath() {
        return path;
    }

    public String getProjectPath() {
        return projectPath;
    }

    @Override
    protected final String describe() {
        return "Task: " + path + ": " + describeTaskEvent();
    }

    protected abstract String describeTaskEvent();

}
