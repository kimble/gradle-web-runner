package com.developerb.gviz.exec;

import com.developerb.gviz.events.Event;
import com.google.common.collect.Lists;

import java.util.Collections;
import java.util.List;

/**
 * @author Kim A. Betti
 */
public class EventStore {

    private final List<Event> store = Lists.newArrayList();

    public void push(Event... events) {
        synchronized (store) {
            Collections.addAll(store, events);
        }
    }


}
