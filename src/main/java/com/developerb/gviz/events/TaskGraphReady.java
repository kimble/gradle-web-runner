package com.developerb.gviz.events;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.base.Joiner;

import java.util.List;
import java.util.Set;

/**
 * @author Kim A. Betti
 */
public class TaskGraphReady extends Event {

    private final List<Task> tasks;

    @JsonCreator
    public TaskGraphReady(@JsonProperty("tasks") List<Task> tasks) {
        this.tasks = tasks;
    }

    public List<Task> getTasks() {
        return tasks;
    }

    @Override
    protected String describe() {
        return "Task graph consisting of " + tasks.size() + " tasks completed";
    }

    public static class Task {

        private final String type;
        private final String name;
        private final String path;
        private final String description;
        private final Set<String> dependsOn;

        @JsonCreator
        public Task(@JsonProperty("type") String type,
                    @JsonProperty("name") String name,
                    @JsonProperty("path") String path,
                    @JsonProperty("description") String description,
                    @JsonProperty("dependsOn") Set<String> dependsOn) {

            this.type = type;
            this.name = name;
            this.path = path;
            this.description = description;
            this.dependsOn = dependsOn;
        }

        public String getName() {
            return name;
        }

        public String getPath() {
            return path;
        }

        public String getDescription() {
            return description;
        }

        public Set<String> getDependsOn() {
            return dependsOn;
        }

        public String getType() {
            return type;
        }

        @Override
        public String toString() {
            return String.format("%s [%s] - %s (%s) depending on [%s]", path, type, name, description, Joiner.on(", ").join(dependsOn));
        }

    }

}
