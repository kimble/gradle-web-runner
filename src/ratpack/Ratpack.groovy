import ratpack.groovy.template.TextTemplateModule

import static ratpack.groovy.Groovy.groovyTemplate
import static ratpack.groovy.Groovy.ratpack

ratpack {

    bindings {
        module TextTemplateModule, { TextTemplateModule.Config config -> config.staticallyCompile = true }
    }

    handlers {
        get {
            render groovyTemplate("skin.html", title: "Groovy Web Console")
        }

        fileSystem "public", { f -> f.files() }
    }

}
