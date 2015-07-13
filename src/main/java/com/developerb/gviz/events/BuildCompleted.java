package com.developerb.gviz.events;

import java.util.Date;

/**
 * @author Kim A. Betti
 */
public class BuildCompleted extends Event {

    private final int exitValue;

    public BuildCompleted(int exitValue) {
        super(new Date());
        this.exitValue = exitValue;
    }

    public int getExitValue() {
        return exitValue;
    }

    @Override
    protected String describe() {
        return "Build process completed with exit value: " + exitValue;
    }

}
