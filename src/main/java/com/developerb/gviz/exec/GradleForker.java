package com.developerb.gviz.exec;

import com.google.common.collect.Lists;
import org.zeroturnaround.exec.InvalidExitValueException;
import org.zeroturnaround.exec.ProcessExecutor;
import org.zeroturnaround.exec.ProcessResult;
import org.zeroturnaround.exec.StartedProcess;
import org.zeroturnaround.exec.stream.LogOutputStream;

import java.io.File;
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


    public void execute(Build build, BuildParameters parameters) {
        try {
            List<String> command = buildCommand(parameters);

            ProcessExecutor executor = configureExecutor(parameters.projectDirectory(), command);
            redirectOutputToBuild(build, executor);

            StartedProcess process = executor.start();
            build.onGradleProcessForked(parameters, command);
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

    /**
     * Build the command line which consist of the following parts
     *
     *  1. Project directory
     *  2. Wrapper script (won't play nice with Windows like this..)
     *  3. Default parameters we
     *  4. Init script containing our spy
     *  5. Tasks to run
     *  6. Project specific build parameters
     */
    private List<String> buildCommand(BuildParameters parameters) {
        List<String> builder = Lists.newArrayList("./gradlew", "--stacktrace", "--init-script", gradleInitScript.getAbsolutePath());
        builder.addAll(parameters.createCommandLine());

        return builder;
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
