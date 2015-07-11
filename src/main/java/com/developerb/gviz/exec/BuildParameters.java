package com.developerb.gviz.exec;

import com.google.common.base.Joiner;
import com.google.common.base.Objects;
import com.google.common.collect.Lists;

import java.io.File;
import java.util.List;

/**
 * Project specific stuff
 *
 * @author Kim A. Betti
 */
public final class BuildParameters {

    private final File projectDirectory;
    private final List<String> commandLine;


    public BuildParameters(File projectDirectory, String tasks, List<BuildFeature> features) {

        // Project
        this.projectDirectory = projectDirectory;

        // Tasks
        this.commandLine = Lists.newArrayList(tasks.split("\\s+"));

        // Build features
        for (BuildFeature feature : features) {
            commandLine.addAll(feature.commandLine);
        }

    }

    public File projectDirectory() {
        return projectDirectory;
    }

    public List<String> createCommandLine() {
        return commandLine;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        BuildParameters that = (BuildParameters) o;
        return Objects.equal(projectDirectory, that.projectDirectory) &&
                Objects.equal(commandLine, that.commandLine);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(projectDirectory, commandLine);
    }

    @Override
    public String toString() {
        return String.format("%s --%s", projectDirectory, Joiner.on(", ").join(commandLine));
    }




    abstract static class BuildFeature {
        final List<String> commandLine;

        protected BuildFeature(String... commandLine) {
            this.commandLine = Lists.newArrayList(commandLine);
        }
    }

    public static class EnableDaemon extends BuildFeature {
        public EnableDaemon() {
            super("--daemon");
        }
    }

    public static class ConfigureOnDemand extends BuildFeature {
        public ConfigureOnDemand() {
            super("--configure-on-demand");
        }
    }

    public static class BuildInParallel extends BuildFeature {
        public BuildInParallel(Integer maxWorkers) {
            super("--parallel", "--max-workers", maxWorkers.toString());
        }
    }

}
