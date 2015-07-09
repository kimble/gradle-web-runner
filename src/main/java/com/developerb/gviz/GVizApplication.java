package com.developerb.gviz;


import com.developerb.gviz.exec.BuildRepository;
import com.developerb.gviz.exec.BuildWebsocketServlet;
import com.developerb.gviz.exec.ExecResource;
import com.developerb.gviz.exec.GradleForker;
import com.developerb.gviz.root.RootResource;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.dropwizard.Application;
import io.dropwizard.assets.AssetsBundle;
import io.dropwizard.setup.Bootstrap;
import io.dropwizard.setup.Environment;
import io.dropwizard.views.ViewBundle;

import javax.servlet.ServletRegistration;
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
        GradleForker gradleForker = new GradleForker(gradleInitScript);
        BuildRepository buildRepository = new BuildRepository(gradleForker, environment.getObjectMapper());

        environment.jersey().register(new RootResource());
        environment.jersey().register(new ExecResource(buildRepository));

        registerWebsocket(environment, buildRepository);
    }

    private void registerWebsocket(Environment environment, BuildRepository buildRepository) {
        ObjectMapper jackson = environment.getObjectMapper();
        BuildWebsocketServlet servlet = new BuildWebsocketServlet(buildRepository, jackson);

        ServletRegistration.Dynamic ws = environment.servlets().addServlet("ws", servlet);
        ws.setAsyncSupported(true);
        ws.addMapping("/ws/*");
        ws.setLoadOnStartup(1);
    }

}
