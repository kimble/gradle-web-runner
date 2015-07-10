package com.developerb.gviz.exec;

import java.util.Objects;

/**
 * @author Kim A. Betti
 */
public class BuildContext {

    private final String path;
    private final String commandLine;

    public BuildContext(String path, String commandLine) {
        this.path = path;
        this.commandLine = commandLine;
    }

    @Override
    public String toString() {
        return path + " / " + commandLine;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        BuildContext that = (BuildContext) o;
        return Objects.equals(path, that.path) &&
                Objects.equals(commandLine, that.commandLine);
    }

    @Override
    public int hashCode() {
        return Objects.hash(path, commandLine);
    }

}
