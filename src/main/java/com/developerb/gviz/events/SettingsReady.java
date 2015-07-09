package com.developerb.gviz.events;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Map;

/**
 * @author Kim A. Betti
 */
public class SettingsReady {

    private final Map<String, Object> settings;

    @JsonCreator
    public SettingsReady(@JsonProperty("settings") Map<String, Object> settings) {
        this.settings = settings;
    }

    public Map<String, Object> getSettings() {
        return settings;
    }

}
