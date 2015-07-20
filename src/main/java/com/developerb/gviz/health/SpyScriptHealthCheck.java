package com.developerb.gviz.health;

import com.codahale.metrics.health.HealthCheck;

import java.io.File;

/**
 * Verify that our init / spy script really exists
 * where we expect it to be..
 *
 * @author Kim A. Betti
 */
public class SpyScriptHealthCheck extends HealthCheck {

    private final File script;

    public SpyScriptHealthCheck(File script) {
        this.script = script;
    }

    @Override
    protected Result check() throws Exception {
        if (script.exists() && script.isFile()) {
            return Result.healthy(script.getAbsolutePath() + " in place <3");
        }
        else {
            return Result.unhealthy(script.getAbsolutePath() + " missing");
        }
    }

}
