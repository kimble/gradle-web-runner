package com.developerb.gviz.exec;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.Maps;

import java.util.Optional;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.atomic.AtomicInteger;

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

    public Build create() {
        Integer buildNumber = sequence.incrementAndGet();
        Build build = new Build(buildNumber, gradleForker, jackson);
        builds.put(buildNumber, build);

        return build;
    }

    public Optional<Build> get(Integer buildNumber) {
        return Optional.ofNullable (
                builds.get(buildNumber)
        );
    }

}
