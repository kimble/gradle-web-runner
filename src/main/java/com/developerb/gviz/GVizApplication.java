package com.developerb.gviz;


import com.developerb.gviz.exec.ExecResource;
import com.developerb.gviz.exec.GradleForker;
import com.developerb.gviz.root.RootResource;
import io.dropwizard.Application;
import io.dropwizard.assets.AssetsBundle;
import io.dropwizard.setup.Bootstrap;
import io.dropwizard.setup.Environment;
import io.dropwizard.views.ViewBundle;

import java.io.File;

/**
 * @author Kim A. Betti
 */
public class GVizApplication extends Application<GVizConfiguration> {

    public static void main(String... args) throws Exception {
        new GVizApplication().run(args);
    }

    @Override
    public void initialize(Bootstrap<GVizConfiguration> bootstrap) {
        bootstrap.addBundle(new AssetsBundle("/assets/", "/assets"));
        bootstrap.addBundle(new ViewBundle<>());
    }

    @Override
    public void run(GVizConfiguration configuration, Environment environment) throws Exception {

        File gradleInitScript = configuration.writeScriptToTemporaryDirectory();
        GradleForker buildLauncher = new GradleForker(gradleInitScript);


        environment.jersey().register(new RootResource());
        environment.jersey().register(new ExecResource(buildLauncher, environment.getObjectMapper()));
    }

}
