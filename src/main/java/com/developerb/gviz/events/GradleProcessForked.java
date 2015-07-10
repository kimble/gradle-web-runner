package com.developerb.gviz.events;

import com.google.common.base.Joiner;

import java.io.File;
import java.util.Date;
import java.util.List;

/**
 * Emitted after forking of the Gradle process has been forked.
 * @author Kim A. Betti
 */
public class GradleProcessForked extends Event {

    private final String path;
    private final String commandLine;
    private final Date timestamp;

    public GradleProcessForked(File directory, List<String> command) {
        this(directory.getAbsolutePath(), Joiner.on(" ").join(command), new Date());
    }

    public GradleProcessForked(String path, String commandLine, Date timestamp) {
        this.commandLine = commandLine;
        this.timestamp = timestamp;
        this.path = path;
    }

    public String getCommandLine() {
        return commandLine;
    }

    public Date getTimestamp() {
        return timestamp;
    }

    public String getPath() {
        return path;
    }

    @Override
    protected String describe() {
        return "Gradle process forked: " + commandLine + " in " + path;
    }

}
