package com.developerb.gviz.events;

import java.util.Date;

/**
 * @author Kim A. Betti
 */
public abstract class Event {

    private final Date timestamp;

    protected Event(Date timestamp) {
        this.timestamp = timestamp;
    }

    public final Date getTimestamp() {
        return timestamp;
    }

    @Override
    public final String toString() {
        return describe();
    }

    protected abstract String describe();

}
