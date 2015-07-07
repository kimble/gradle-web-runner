import ratpack.groovy.template.TextTemplateModule

import static ratpack.groovy.Groovy.groovyTemplate
import static ratpack.groovy.Groovy.ratpack

ratpack {

    bindings {
        module TextTemplateModule, { TextTemplateModule.Config config -> config.staticallyCompile = true }
    }

    handlers {
        get {
            render groovyTemplate("skin.html")
        }

        fileSystem "public", { f ->  println f ; f.files() }
    }

}
