package com.developerb.gviz.exec;

import com.google.common.base.Joiner;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Lists;
import io.dropwizard.views.View;

import javax.ws.rs.*;
import javax.ws.rs.core.Response;
import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentMap;
import java.util.stream.Collectors;
import java.util.stream.Stream;

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
        Build build = buildRepository.create(request.asParameters());

        Thread thread = new Thread(build::execute); // Todo: Be a bit more clever about this..?
        thread.setName("build-" + build.getBuildNumber());
        thread.setDaemon(false);
        thread.start();

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
            View view = new BuildView(build);

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

    @GET
    @Path("build/{nr}/test-report")
    @Produces("text/html")
    public Response testReport(@PathParam("nr") Integer nr) {
        Optional<Build> optionalBuild = buildRepository.get(nr);

        if (optionalBuild.isPresent()) {
            Build build = optionalBuild.get();
            View view = new TestReportView(build);

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

    @GET
    @Path("build/{nr}/tasks-parallel")
    @Produces("text/html")
    public Response taskParallel(@PathParam("nr") Integer nr) {
        Optional<Build> optionalBuild = buildRepository.get(nr);

        if (optionalBuild.isPresent()) {
            Build build = optionalBuild.get();
            View view = new TaskParallelReportView(build);

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

    @GET
    @Path("build/{nr}/estimates")
    @Produces(APPLICATION_JSON)
    public Response estimates(@PathParam("nr") Integer nr) {
        Optional<Build> optionalBuild = buildRepository.get(nr);

        if (optionalBuild.isPresent()) {
            try {
                Stream<Build> buildStream = buildRepository.streamSimilarBuilds(nr);
                List<Build> similarBuilds = buildStream.collect(Collectors.toList());

                if (similarBuilds.isEmpty()) {
                    return Response.noContent()
                            .entity("No similar builds found")
                            .build();
                }
                else {
                    Build lastSimilarBuild = similarBuilds.get(similarBuilds.size() - 1);
                    BuildStatistics statistics = lastSimilarBuild.getStatistics();
                    ConcurrentMap<String, Long> estimates = statistics.getDurations(); // Use last durations as estimates

                    return Response.ok()
                            .entity(estimates)
                            .build();
                }
            }
            catch (BuildRepository.CantFindSimilarBuilds ex) {
                return Response.noContent()
                        .entity(ex.getMessage())
                        .build();
            }
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

        public boolean configureOnDemand;
        public boolean buildInParallel;
        public boolean allowDaemon;

        public int maximumWorkers;

        public BuildParameters asParameters() {
            File directory = directory();
            List<BuildParameters.BuildFeature> features = features();

            return new BuildParameters(directory, tasks, features);
        }

        private List<BuildParameters.BuildFeature> features() {
            List<BuildParameters.BuildFeature> features = Lists.newArrayList();

            if (configureOnDemand) {
                features.add(new BuildParameters.ConfigureOnDemand());
            }
            if (allowDaemon) {
                features.add(new BuildParameters.EnableDaemon());
            }
            if (buildInParallel) {
                features.add(new BuildParameters.BuildInParallel(maximumWorkers));
            }

            return features;
        }

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

        public String getCommandLine() {
            return Joiner.on(" ").join(build.buildParameters().createCommandLine());
        }

        public Integer getBuildNumber() {
            return build.getBuildNumber();
        }

    }

    public static class TestReportView extends View {

        private final Build build;

        public TestReportView(Build build) {
            super("/templates/build-test-report.ftl", UTF_8);
            this.build = build;
        }

        public String getCommandLine() {
            return Joiner.on(" ").join(build.buildParameters().createCommandLine());
        }

        public Integer getBuildNumber() {
            return build.getBuildNumber();
        }

    }

    public static class TaskParallelReportView extends View {
        private final Build build;

        public TaskParallelReportView(Build build) {
            super("/templates/build-tasks-parallel.ftl", UTF_8);
            this.build = build;
        }

        public String getCommandLine() {
            return Joiner.on(" ").join(build.buildParameters().createCommandLine());
        }

        public Integer getBuildNumber() {
            return build.getBuildNumber();
        }

    }

}
