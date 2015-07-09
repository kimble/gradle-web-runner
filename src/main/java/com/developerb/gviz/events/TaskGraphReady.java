package com.developerb.gviz.events;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;
import java.util.Set;

/**
 * @author Kim A. Betti
 */
public class TaskGraphReady {

    private final List<Task> tasks;

    @JsonCreator
    public TaskGraphReady(@JsonProperty("tasks") List<Task> tasks) {
        this.tasks = tasks;
    }

    public List<Task> getTasks() {
        return tasks;
    }


    public static class Task {

        private final String name;
        private final String path;
        private final String description;
        private final Set<String> dependsOn;

        @JsonCreator
        public Task(@JsonProperty("name") String name,
                    @JsonProperty("path") String path,
                    @JsonProperty("description") String description,
                    @JsonProperty("dependsOn") Set<String> dependsOn) {

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

    }

}
