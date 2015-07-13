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

        <script src="/assets/page/pubsub.js"></script>
        <script src="/assets/page/build-websockets.js"></script>

        <script src="/assets/page/test-report/test-report.js"></script>

        <link href='http://fonts.googleapis.com/css?family=Architects+Daughter' rel='stylesheet' type='text/css'>
        <link href='http://fonts.googleapis.com/css?family=Oswald:400,700,300' rel='stylesheet' type='text/css'>





        <style type="text/css">
            .container-full {
                margin: 0 auto;
                padding-left: 1em;
                width: 95%;
            }

            .page-header, #headerRow {
                font-family: 'Oswald', sans-serif;
            }

            svg {
                z-index: 0;
            }

            h3 {
                font-size: 1.3em;
            }
        </style>
    </head>
    <body>



        <div class="container container-full">
            <div class="row">
                <div id="headerRow" class="col-md-12">
                    <h1>#${buildNumber} - Test report - <span class="project-name">Waiting for project name...</span> <br/> <small>./gradlew ${commandLine}</small></h1>
                </div>
            </div>

            <div class="row">
                <div class="col-md-4">
                    <div class="page-header">
                        <h2>Packages</h2>
                    </div>
                    <div id="packages"></div>
                </div>
                <div class="col-md-4">
                    <div class="page-header">
                        <h2>Classes</h2>
                    </div>
                    <div id="classes"></div>
                </div>
                <div class="col-md-4">
                    <div class="page-header">
                        <h2>Tests</h2>
                    </div>
                    <div id="tests"></div>
                </div>
            </div>
        </div>









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
