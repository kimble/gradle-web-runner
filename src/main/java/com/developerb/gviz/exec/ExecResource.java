package com.developerb.gviz.exec;

import com.google.common.collect.ImmutableMap;
import io.dropwizard.views.View;

import javax.ws.rs.*;
import javax.ws.rs.core.Response;
import java.io.File;
import java.io.IOException;
import java.util.Optional;

import static com.google.common.base.Charsets.UTF_8;
import static javax.ws.rs.core.MediaType.APPLICATION_JSON;
import static javax.ws.rs.core.Response.Status.NOT_FOUND;


@Path("/api")
public class ExecResource {

    private final BuildRepository buildRepository;

    public ExecResource(BuildRepository buildRepository) throws IOException {
        this.buildRepository = buildRepository;
    }


    @POST
    @Path("exec")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    public Response exec(ExecRequest request) {
        Build build = buildRepository.create();

        new Thread(() -> build.execute(request.directory(), request.tasks)).start();

        return Response.ok()
                .entity(ImmutableMap.of("number", build.getBuildNumber()))
                .build();
    }

    @GET
    @Path("build/{nr}")
    @Produces("text/html")
    public Response viewBuild(@PathParam("nr") Integer nr) {
        Optional<Build> optionalBuild = buildRepository.get(nr);

        if (optionalBuild.isPresent()) {
            Build build = optionalBuild.get();
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
            super("/templates/build-progress.ftl", UTF_8);
            this.build = build;
        }

        public Integer getBuildNumber() {
            return build.getBuildNumber();
        }

    }

}
