package com.developerb.gviz.exec;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Charsets;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Maps;
import io.dropwizard.views.View;

import javax.ws.rs.*;
import javax.ws.rs.core.Response;
import java.io.File;
import java.io.IOException;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.atomic.AtomicInteger;

import static javax.ws.rs.core.MediaType.APPLICATION_JSON;
import static javax.ws.rs.core.Response.Status.NOT_FOUND;


@Path("/api")
public class ExecResource {

    private final AtomicInteger buildNumber = new AtomicInteger(0);
    private final ConcurrentMap<Integer, Build> builds = Maps.newConcurrentMap();

    private final GradleForker gradleForker;
    private final ObjectMapper objectMapper;


    public ExecResource(GradleForker gradleForker, ObjectMapper objectMapper) throws IOException {
        this.gradleForker = gradleForker;
        this.objectMapper = objectMapper;
    }



    @POST
    @Path("exec")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    public Response exec(ExecRequest request) {
        Integer buildNumber = this.buildNumber.incrementAndGet();
        Build build = new Build(buildNumber, gradleForker, objectMapper);

        builds.put(buildNumber, build);

        new Thread(() -> build.execute(request.directory(), request.tasks)).start();

        return Response.ok()
                .entity(ImmutableMap.of("number", buildNumber))
                .build();
    }

    @GET
    @Path("build/{nr}")
    @Produces("text/html")
    public Response viewBuild(@PathParam("nr") Integer nr) {
        if (builds.containsKey(nr)) {
            Build build = builds.get(nr);
            BuildView view = new BuildView(build);

            return Response.ok()
                    .entity(view)
                    .build();
        }
        else {
            return Response.status(NOT_FOUND)
                    .entity("No such build: " + nr)
                    .build();
        }
    }


    public static class ExecRequest {

        public String path;
        public String tasks;

        public File directory() {
            return new File(path);
        }

    }


    public static class BuildView extends View {

        private final Build build;

        public BuildView(Build build) {
            super("/templates/build.ftl", Charsets.UTF_8);
            this.build = build;
        }

        public Integer getBuildNumber() {
            return build.getBuildNumber();
        }

    }

}
