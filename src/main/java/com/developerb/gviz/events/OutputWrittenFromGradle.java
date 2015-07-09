package com.developerb.gviz.events;

import java.util.Date;

/**
 * @author Kim A. Betti
 */
public class OutputWrittenFromGradle extends Event {

    private final Date timestamp;
    private final String line;

    public OutputWrittenFromGradle(Date timestamp, String line) {
        this.timestamp = timestamp;
        this.line = line;
    }

    public Date getTimestamp() {
        return timestamp;
    }

    public String getLine() {
        return line;
    }

}
