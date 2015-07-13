<#-- @ftlvariable name="" type="com.developerb.gviz.exec.ExecResource.BuildView" -->
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>Gradle Web Runner - Build - ${buildNumber}</title>

        <link href='http://fonts.googleapis.com/css?family=Architects+Daughter' rel='stylesheet' type='text/css'>
        <link href='http://fonts.googleapis.com/css?family=Oswald:400,700,300' rel='stylesheet' type='text/css'>


        <link href="/assets/bootstrap/css/bootstrap.min.css" rel="stylesheet">
        <link href="/assets/flipclock/flipclock.css" rel="stylesheet">

        <script src="/assets/jquery/jquery-2.1.4.min.js"></script>
        <script src="/assets/flipclock/flipclock.min.js"></script>
        <script src="/webjars/baconjs/0.7.18/Bacon.js"></script>
        <script src="/assets/d3/d3.min.js"></script>

        <script src="/assets/page/in-progress/task-state.js"></script>

        <script src="/assets/page/in-progress/build-details/build-details.js"></script>



        <script src="/assets/page/in-progress/running-tasks/running-tasks.js"></script>
        <script src="/assets/page/in-progress/mini-test-report/mini-test-report.js"></script>
        <script src="/assets/page/in-progress/counters/counters.js"></script>
        <script src="/assets/page/in-progress/gradle-output/gradle-output.js"></script>
        <script src="/assets/page/in-progress/task-stack-panel/task-panel.js"></script>
        <script src="/assets/page/in-progress/build-estimate/build-estimate.js"></script>

        <link rel="stylesheet" href="/assets/page/in-progress/mini-test-report/mini-test-report.css" />
        <link rel="stylesheet" href="/assets/page/in-progress/running-tasks/running-tasks.css" />
        <link rel="stylesheet" href="/assets/page/in-progress/counters/counters.css" />
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

            .counter-container {
                position: relative;
                z-index: 10;
            }

            .moving-panel {
                position: absolute;
                z-index: 100;

                border: 1px solid #eee;
                box-shadow: 0 0 60px rgba(0, 0, 0, 0.1);
                background-color: #fafafa;

                transition-property: background-color, top, bottom, right, left;
                transition-duration: 0.7s;
            }

            .moving-panel.shy {
                background-color: #fafafa;
            }

            .moving-panel .page-header {
                cursor: pointer;
            }

            .moving-panel .output-container>div {
                padding: 0 1em 0 1em;
            }

            .moving-panel .page-header {
                background-color: rgb(174, 199, 59);
                padding: 0.1em 1em 1em 1em;
                margin: 0;
                color: white;
            }
            .moving-panel .page-header  small {
                color: white;
            }

            .moving-panel.upside-down .page-header {
                position: absolute;
                bottom: -20px;
                width: 95%;
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




        <!-- Counters -->
        <div id="counterPanel">
            <div class="row">
                <div class="col-md-3 counter-container" id="taskCounterContainer">
                    <h3>Remaining tasks</h3>
                    <div id="taskCountdown"></div>
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
                <p>Yet to be implemented!</p>
                <p>This panel should contain a simple summary<br/>+ a link to a complete and interactive report page.</p>
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
                var ws = new WebSocket("ws://localhost:8080/ws/build");



                var pubsub = (function() {
                    var bus = new Bacon.Bus();

                    // Create a stream of simple keyboard commands
                    $(document).keydown(function(event) {
                        var key = String.fromCharCode(event.keyCode);
                        var eventType = "key-down-" + key;

                        bus.push({
                            type: eventType,
                            event: {}
                        });
                    });

                    // Dead simple pubsub event-bus with reactive
                    // capabilities provided by Bacon.js
                    return {
                        broadcast: function() {
                            if (arguments.length == 2) {
                                bus.push({
                                    type: arguments[0],
                                    event: arguments[1]
                                });
                            }
                            else {
                                bus.push(arguments[0]);
                            }
                        },
                        stream: function(type) {
                            return bus.filter(function (transfer) {
                                return transfer.type == type;
                            }).map(function(transfer) {
                                return transfer.event;
                            });
                        }
                    }
                })();


                // Interface

                createGradleOutputConsole(pubsub);
                createRunningTasks(pubsub);
                createBuildDetailsTab(pubsub);
                createCounters(pubsub);
                createRunningTestReport(pubsub);
                createTaskPanel(pubsub);
                createBuildEstimate(pubsub);

                // State

                initializeTaskState(pubsub, buildNumber);



                ws.onopen = function() {
                    ws.send(buildNumber);

                    ws.onmessage = function(message) {
                        var transfer = JSON.parse(message.data);
                        pubsub.broadcast(transfer);

                        if (transfer.type === 'GradleBuildCompleted') {
                            console.info("Got last event, closing the websocket");
                            ws.close();
                        }
                    }

                };

                ws.onclose = function() {
                    console.info("Websocket closed");
                }

            })();
        </script>

    </body>
</html>
