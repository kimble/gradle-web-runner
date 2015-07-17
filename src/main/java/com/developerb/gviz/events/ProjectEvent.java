package com.developerb.gviz.events;

import java.util.Date;

/**
 * @author Kim A. Betti
 */
public abstract class ProjectEvent extends Event {

    protected final String path;

    protected ProjectEvent(String path) {
        super(new Date());

        this.path = path;
    }

    public String getPath() {
        return path;
    }

}
