package com.developerb.gviz.exec;

import org.zeroturnaround.exec.InvalidExitValueException;
import org.zeroturnaround.exec.ProcessExecutor;
import org.zeroturnaround.exec.ProcessResult;
import org.zeroturnaround.exec.stream.LogOutputStream;

import java.io.File;

/**
 * Responsible for launching a Gradle build process with the correct parameters.
 *
 * @author Kim A. Betti
 */
public class GradleForker {

    private final File gradleInitScript;

    public GradleForker(File gradleInitScript) {
        this.gradleInitScript = gradleInitScript;
    }


    public void execute(Build build, File directory, String tasks) {
        try {
            ProcessExecutor executor = configureExecutor(directory, tasks);
            redirectOutputToBuild(build, executor);
            ProcessResult result = executor.executeNoTimeout(); // Blocking..
            build.onCompletion(result.getExitValue());
        }
        catch (InvalidExitValueException ex) {
            build.onUnknownFailure("Gradle process exited with a non-zero exit code", ex);
        }
        catch (Exception ex) {
            build.onUnknownFailure("Unexpected exception while running forked Gradle build", ex);
        }
    }

    private ProcessExecutor configureExecutor(File directory, String tasks) {
        return new ProcessExecutor()
                .directory(directory)
                .environment("SPY_PORT", "10000")
                .command("./gradlew", "--stacktrace", "--init-script", gradleInitScript.getAbsolutePath(), tasks)
                .readOutput(true)
                .exitValues(0);
    }

    /**
     * Lines written from the forked Gradle process is forwarded to the build
     */
    private void redirectOutputToBuild(final Build build, ProcessExecutor executor) {
        executor.redirectOutput(new LogOutputStream() {

            @Override
            protected void processLine(String line) {
                build.onConsoleOutput(line);
            }

        });
    }

}
