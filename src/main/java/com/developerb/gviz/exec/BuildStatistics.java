package com.developerb.gviz.exec;

import com.google.common.collect.Maps;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Date;
import java.util.concurrent.ConcurrentMap;

/**
 * @author Kim A. Betti
 */
public class BuildStatistics {

    private final static Logger log = LoggerFactory.getLogger(BuildStatistics.class);


    private final ConcurrentMap<String, Date> inProgress = Maps.newConcurrentMap();
    private final ConcurrentMap<String, Long> durations = Maps.newConcurrentMap();


    public void started(String key, Date timestamp) {
        inProgress.put(key, timestamp);
    }

    public void finished(String key, Date timestamp) {
        Date started = inProgress.remove(key);

        if (started != null) {
            long duration = timestamp.getTime() - started.getTime();
            reportDuration(key, duration);
        }
        else {
            log.error("Finish before start, {}", key);
        }
    }

    public void reportDuration(String key, long durationMillis) {
        durations.put(key, durationMillis);
    }

    public ConcurrentMap<String, Long> getDurations() {
        return durations;
    }

}
