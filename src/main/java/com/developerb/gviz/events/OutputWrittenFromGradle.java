package com.developerb.gviz.events;

import java.util.Date;

/**
 * @author Kim A. Betti
 */
public class OutputWrittenFromGradle extends Event {

    private final String line;

    public OutputWrittenFromGradle(Date timestamp, String line) {
        super(timestamp);
        this.line = line;
    }

    public String getLine() {
        return line;
    }

    @Override
    protected String describe() {
        return "GRADLE: " + line;
    }

}
