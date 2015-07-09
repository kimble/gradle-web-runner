package com.developerb.gviz.events;

/**
 * @author Kim A. Betti
 */
public class BuildCompleted extends Event {

    private final int exitValue;

    public BuildCompleted(int exitValue) {
        this.exitValue = exitValue;
    }

    public int getExitValue() {
        return exitValue;
    }

}
