package com.developerb.gviz.exec;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.Maps;

import java.util.Optional;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Stream;

/**
 * @author Kim A. Betti
 */
public class BuildRepository {

    private final AtomicInteger sequence = new AtomicInteger(0);
    private final ConcurrentMap<Integer, Build> builds = Maps.newConcurrentMap();

    private final GradleForker gradleForker;
    private final ObjectMapper jackson;

    public BuildRepository(GradleForker gradleForker, ObjectMapper jackson) {
        this.gradleForker = gradleForker;
        this.jackson = jackson;
    }

    public Build create(BuildParameters parameters) {
        Integer buildNumber = sequence.incrementAndGet();
        Build build = new Build(buildNumber, parameters, gradleForker, jackson);
        builds.put(buildNumber, build);

        return build;
    }

    public Optional<Build> get(Integer buildNumber) {
        return Optional.ofNullable (
                builds.get(buildNumber)
        );
    }

    public Stream<Build> streamSimilarBuilds(Integer buildNumber) throws CantFindSimilarBuilds {
        Optional<Build> optionalBuild = get(buildNumber);
        if (!optionalBuild.isPresent()) {
            throw new IllegalArgumentException("No build: " + buildNumber);
        }
        else {
            Build build = optionalBuild.get();
            BuildParameters buildParameters = build.buildParameters();

            return builds.keySet().stream()
                    .map(builds::get)
                    .filter(b -> !buildNumber.equals(b.getBuildNumber()))
                    .filter(b -> b.hasMatchingContext(buildParameters))
                    .sorted();
        }
    }


    public static class CantFindSimilarBuilds extends Exception {
        public CantFindSimilarBuilds(String message) {
            super(message);
        }
    }

}
