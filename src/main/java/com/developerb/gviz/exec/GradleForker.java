package com.developerb.gviz.exec;

import com.google.common.collect.Lists;
import org.zeroturnaround.exec.InvalidExitValueException;
import org.zeroturnaround.exec.ProcessExecutor;
import org.zeroturnaround.exec.ProcessResult;
import org.zeroturnaround.exec.StartedProcess;
import org.zeroturnaround.exec.stream.LogOutputStream;

import java.io.File;
import java.util.Collections;
import java.util.List;

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
            List<String> command = createCommandLine(tasks);
            ProcessExecutor executor = configureExecutor(directory, command);
            redirectOutputToBuild(build, executor);

            StartedProcess process = executor.start();
            build.onGradleProcessForked(directory, command);
            ProcessResult result = process.getFuture().get();

            build.onCompletion(result.getExitValue());
        }
        catch (InvalidExitValueException ex) {
            build.onUnknownFailure("Gradle process exited with a non-zero exit code", ex);
        }
        catch (Exception ex) {
            build.onUnknownFailure("Unexpected exception while running forked Gradle build", ex);
        }
    }

    private ProcessExecutor configureExecutor(File directory, List<String> command) {
        return new ProcessExecutor()
                .directory(directory)
                .environment("SPY_PORT", "10000")
                .command(command)
                .readOutput(true)
                .destroyOnExit()
                .exitValue(0);
    }

    private List<String> createCommandLine(String tasks) {
        List<String> command = Lists.newArrayList("./gradlew", "--stacktrace", "--no-daemon", "--init-script", gradleInitScript.getAbsolutePath());
        Collections.addAll(command, tasks.split(" "));
        return command;
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
