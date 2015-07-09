package com.developerb.gviz;

import com.google.common.io.CharSource;
import com.google.common.io.Files;
import com.google.common.io.Resources;
import io.dropwizard.Configuration;

import java.io.File;
import java.io.IOException;
import java.net.URL;

import static com.google.common.base.Charsets.UTF_8;

/**
 * @author Kim A. Betti
 */
public class GVizConfiguration extends Configuration {


    File writeScriptToTemporaryDirectory() throws IOException {
        File gradleInitScript;URL resource = Resources.getResource("gradle/gradle-spy.gradle");
        CharSource scriptCharSource = Resources.asCharSource(resource, UTF_8);

        File directory = Files.createTempDir();
        gradleInitScript = new File(directory, "g-viz.gradle");

        Files.write(scriptCharSource.read(), gradleInitScript, UTF_8);

        return gradleInitScript;
    }

}
