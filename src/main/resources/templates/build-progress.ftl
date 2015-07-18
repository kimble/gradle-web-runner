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
        <script src="/assets/bacon/bacon.js"></script>
        <script src="/assets/d3/d3.min.js"></script>
        <script src="/assets/immutable/immutable-min.js"></script>
        <script src="/assets/lodash/lodash-min.js"></script>

        <script src="/assets/page/pubsub.js"></script>
        <script src="/assets/page/build-websockets.js"></script>
        <script src="/assets/page/in-progress/task-state.js"></script>

        <script src="/assets/page/in-progress/build-details/build-details.js"></script>
        <script src="/assets/page/in-progress/running-tasks/running-tasks.js"></script>
        <script src="/assets/page/in-progress/mini-test-report/mini-test-report.js"></script>
        <script src="/assets/page/in-progress/gradle-output/gradle-output.js"></script>
        <script src="/assets/page/in-progress/build-estimate/build-estimate.js"></script>
        <script src="/assets/page/in-progress/project-details/project-details.js"></script>

        <link href='http://fonts.googleapis.com/css?family=Architects+Daughter' rel='stylesheet' type='text/css'>
        <link href='http://fonts.googleapis.com/css?family=Oswald:400,700,300' rel='stylesheet' type='text/css'>

        <link rel="stylesheet" href="/assets/page/moving-panel.css" />

        <link rel="stylesheet" href="/assets/page/in-progress/mini-test-report/mini-test-report.css" />
        <link rel="stylesheet" href="/assets/page/in-progress/running-tasks/running-tasks.css" />
        <link rel="stylesheet" href="/assets/page/in-progress/gradle-output/gradle-output.css" />
        <link rel="stylesheet" href="/assets/page/in-progress/build-estimate/build-estimate.css" />
        <link rel="stylesheet" href="/assets/page/in-progress/build-details/build-details.css" />
        <link rel="stylesheet" href="/assets/page/in-progress/project-details/project-details.css" />


        <style type="text/css">
            * {
                /* So 100% means 100% */
                box-sizing: border-box;
            }

            body {
                overflow: hidden;
                height: 100%;
            }

            .container-full {
                margin: 0;
                width: 100%;
                height: 100%;
                padding-left: 2em;
            }

            .inner-container {
                overflow-y: auto;
                overflow-x: hidden;
                width: calc(100% - 0.8em - (60% - 500px));
                height: 500px;
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
            <div class="inner-container">
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
                    <div class="col-md-12">
                        <div id="tasksScene2"></div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-12">
                        <div id="projectDetails"></div>
                    </div>
                </div>
            </div>
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




        <!-- Project details template -->
        <script type="text/template" id="projectDetailTemplate">
            <div class="project-detail" data-project="<%- root.path %>" data-remaining-tasks="0">
                <div class="page-header">
                    <h3 class="header">
                        <small><%- root.path %></small><br/>
                        <%- root.name %>
                    </h3>
                </div>

                <% if (root.description != null) { %>
                    <blockquote>
                        <%- root.description %>
                    </blockquote>
                <% } %>

                <div class="project-tasks"></div>
            </div>
        </script>

        <script type="text/template" id="taskDetailTemplate">
            <div class="task-details" data-task="<%- root.path %>">
                <span class="task-icon glyphicon glyphicon-record" title="Not started"></span>

                <span title="<%- root.name %>"><%- _.trunc(root.name, 25) %></span>
                <span class="duration"></span>
            </div>
            <br/>
        </script>





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

                createGradleOutputConsole(pubsub, buildNumber);
                // createRunningTasks(pubsub);
                createBuildDetailsTab(pubsub);
                createRunningTestReport(pubsub);
                createBuildEstimate(pubsub);
                createProjectDetails(pubsub);

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
