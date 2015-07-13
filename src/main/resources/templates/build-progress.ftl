<#-- @ftlvariable name="" type="com.developerb.gviz.exec.ExecResource.BuildView" -->
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>Gradle Web Runner - Build - ${buildNumber}</title>


        <link href="/assets/bootstrap/css/bootstrap.min.css" rel="stylesheet">

        <script src="/assets/jquery/jquery-2.1.4.min.js"></script>
        <script src="/webjars/baconjs/0.7.18/Bacon.js"></script>
        <script src="/assets/d3/d3.min.js"></script>

        <script src="/assets/page/pubsub.js"></script>
        <script src="/assets/page/build-websockets.js"></script>
        <script src="/assets/page/in-progress/task-state.js"></script>

        <script src="/assets/page/in-progress/build-details/build-details.js"></script>
        <script src="/assets/page/in-progress/running-tasks/running-tasks.js"></script>
        <script src="/assets/page/in-progress/mini-test-report/mini-test-report.js"></script>
        <script src="/assets/page/in-progress/gradle-output/gradle-output.js"></script>
        <script src="/assets/page/in-progress/task-stack-panel/task-panel.js"></script>
        <script src="/assets/page/in-progress/build-estimate/build-estimate.js"></script>

        <link href='http://fonts.googleapis.com/css?family=Architects+Daughter' rel='stylesheet' type='text/css'>
        <link href='http://fonts.googleapis.com/css?family=Oswald:400,700,300' rel='stylesheet' type='text/css'>

        <link rel="stylesheet" href="/assets/page/moving-panel.css" />

        <link rel="stylesheet" href="/assets/page/in-progress/mini-test-report/mini-test-report.css" />
        <link rel="stylesheet" href="/assets/page/in-progress/running-tasks/running-tasks.css" />
        <link rel="stylesheet" href="/assets/page/in-progress/gradle-output/gradle-output.css" />
        <link rel="stylesheet" href="/assets/page/in-progress/task-stack-panel/task-panel.css" />
        <link rel="stylesheet" href="/assets/page/in-progress/build-estimate/build-estimate.css" />
        <link rel="stylesheet" href="/assets/page/in-progress/build-details/build-details.css" />


        <style type="text/css">
            body {
                overflow: hidden;
            }

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
        </style>
    </head>
    <body>



        <div class="container container-full">
            <div class="row">
                <div id="headerRow" class="col-md-12">
                    <h1>#${buildNumber} <span class="project-name">Waiting for project name...</span> <small>./gradlew ${commandLine}</small></h1>

                    <div id="buildProgress">
                        <div class="bar"></div>
                        <div class="bar-label">No estimate..</div>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-md-8">
                    <div id="tasksScene2"></div>
                </div>
            </div>
        </div>




        <!-- Tasks -->
        <div id="taskPanel" class="moving-panel shy">
            <div id="taskStack"></div>
        </div>


        <!-- Gradle output -->
        <div id="gradleOutput" class="moving-panel shy">
            <div class="output-container">
                <div class="intro">Waiting to receive output from forked Gradle process.<br/>Hit [O] to expand this panel.<br/></div>
            </div>
        </div>

        <!-- Build details -->
        <div id="buildDetails" class="moving-panel shy">
            <div class="page-header">
                <h3>Build <u>d</u>etails <small class="project-name">....</small></h3>
            </div>

            <table id="buildDetailsContainer" class="table table-hover">
                <tbody></tbody>
            </table>
        </div>

        <!-- Mini test report -->
        <div id="miniTestReport" class="moving-panel shy">
            <div class="page-header">
                <h3><u>T</u>est report <small class="summary">Awaiting test results..</small></h3>
            </div>

            <div class="panel-container">
                <div class="waiting-message">
                    <p>Nice work!!</p>
                    <p>Not a single test has failed so far!</p>
                </div>
            </div>
        </div>









        <script type="text/javascript">
            function namedAttr(name) {
                return function(obj) {
                    return obj[name];
                };
            }

            function not(func) {
                return function() {
                    return !func();
                }
            }


            (function() {
                "use strict";

                var buildNumber = ${buildNumber};






                // Interface

                createGradleOutputConsole(pubsub);
                createRunningTasks(pubsub);
                createBuildDetailsTab(pubsub);
                createRunningTestReport(pubsub);
                createTaskPanel(pubsub);
                createBuildEstimate(pubsub);

                // State

                initializeTaskState(pubsub, buildNumber);


                // Connect to websocket

                streamBuildEvents(pubsub, buildNumber);




                // Shy panels

                var $panel = $(".moving-panel");

                $panel.asEventStream("mouseenter")
                        .map(".target")
                        .map($)
                        .onValue(function($el) {
                            $el.closest(".moving-panel").removeClass("shy");
                        });

                $panel.asEventStream("mouseleave")
                        .map(".target")
                        .map($)
                        .onValue(function($el) {
                            $el.closest(".moving-panel").addClass("shy");
                        });



            })();
        </script>

    </body>
</html>
