package com.developerb.gviz.events;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.base.Joiner;

import java.util.Map;

/**
 * @author Kim A. Betti
 */
public class SettingsReady extends Event {

    private final Map<String, Object> settings;

    @JsonCreator
    public SettingsReady(@JsonProperty("settings") Map<String, Object> settings) {
        if (settings == null) {
            throw new IllegalArgumentException("Settings can't be null");
        }

        this.settings = settings;
    }

    public Map<String, Object> getSettings() {
        return settings;
    }

    @Override
    protected String describe() {
        return "Build settings: " + Joiner.on(", ")
                .useForNull("[blank]")
                .withKeyValueSeparator(": ")
                .join(settings);
    }

}
