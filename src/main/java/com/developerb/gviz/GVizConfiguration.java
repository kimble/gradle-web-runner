package com.developerb.gviz;

import com.google.common.io.CharSource;
import com.google.common.io.Files;
import com.google.common.io.Resources;
import io.dropwizard.Configuration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.net.URL;

import static com.google.common.base.Charsets.UTF_8;

/**
 * @author Kim A. Betti
 */
public class GVizConfiguration extends Configuration {

    private final static Logger log = LoggerFactory.getLogger(GVizConfiguration.class);



    /**
     * Write our Gradle init script containing the spy to a location
     * on the file system where it is accessible for Gradle build processes.
     */
    File writeScriptToTemporaryDirectory() throws IOException {
        String temporaryDirectoryPath = System.getProperty("java.io.tmpdir");
        File temporaryDirectory = new File(temporaryDirectoryPath);
        File gradleInitScript = new File(temporaryDirectory, "g-viz.gradle");

        URL resource = Resources.getResource("gradle/gradle-spy.gradle");
        CharSource scriptCharSource = Resources.asCharSource(resource, UTF_8);
        Files.write(scriptCharSource.read(), gradleInitScript, UTF_8);

        log.info("Wrote spy script to {}", gradleInitScript.getAbsolutePath());

        return gradleInitScript;
    }

}
