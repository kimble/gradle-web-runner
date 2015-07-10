package com.developerb.gviz.events;

/**
 * @author Kim A. Betti
 */
public abstract class Event {

    @Override
    public final String toString() {
        return describe();
    }

    protected abstract String describe();

}
