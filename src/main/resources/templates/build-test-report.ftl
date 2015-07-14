<#-- @ftlvariable name="" type="com.developerb.gviz.exec.ExecResource.BuildView" -->
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>Gradle Web Runner - Build - ${buildNumber} - Test report</title>


        <link href="/assets/bootstrap/css/bootstrap.min.css" rel="stylesheet">

        <script src="/assets/jquery/jquery-2.1.4.min.js"></script>
        <script src="/webjars/baconjs/0.7.18/Bacon.js"></script>
        <script src="/assets/d3/d3.min.js"></script>
        <script src="/assets/underscore/underscore-min.js"></script>

        <script src="/assets/page/pubsub.js"></script>
        <script src="/assets/page/build-websockets.js"></script>

        <script src="/assets/page/test-report/test-report.js"></script>

        <link href='/assets/page/test-report/test-report.css' rel='stylesheet' type='text/css'>

        <link href='http://fonts.googleapis.com/css?family=Roboto:400,500,700' rel='stylesheet' type='text/css'>
        <link href='http://fonts.googleapis.com/css?family=Oswald:400,700,300' rel='stylesheet' type='text/css'>
    </head>
    <body>



        <div class="container container-full">
            <div class="row">
                <div id="headerRow" class="col-md-12">
                    <h1>#${buildNumber} - Test report - <span class="project-name">Waiting for project name...</span> <br/> <small>./gradlew ${commandLine}</small></h1>
                </div>
            </div>

            <div class="row">
                <div class="col-md-3">
                    <div class="page-header">
                        <h2>Packages</h2>
                    </div>
                    <div id="packages"></div>
                </div>
            </div>
        </div>





        <script type="text/template" id="packageTemplate" class="template">
            <div class="entity package">
                <h3 class="header">
                    <%- root.name %>
                </h3>

                <p class="summary">
                    <%- root.classCount + " classes with a total of " + root.testCount + " tests" %>
                </p>
            </div>

        </script>



        <script type="text/javascript">
            (function() {
                "use strict";

                var buildNumber = ${buildNumber};

                // Interface
                createTestReport(pubsub);

                // Connect to websocket
                streamBuildEvents(pubsub, buildNumber);


            })();
        </script>

    </body>
</html>
