package com.developerb.gviz.root;

import com.google.common.base.Charsets;
import io.dropwizard.views.View;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;

/**
 * @author Kim A. Betti
 */

@Path("/")
@Produces("text/html")
public class RootResource {

    @GET
    public RootView root() {
        return new RootView();
    }

    public static class RootView extends View {
        protected RootView() {
            super("/templates/index.ftl", Charsets.UTF_8);
        }
    }

}
