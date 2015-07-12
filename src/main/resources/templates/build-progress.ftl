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

        <script src="/assets/lib/task-state.js"></script>

        <script src="/assets/lib/gradle-output.js"></script>
        <script src="/assets/lib/task-panel.js"></script>
        <script src="/assets/lib/build-details.js"></script>
        <script src="/assets/lib/running-tasks.js"></script>
        <script src="/assets/lib/test-report.js"></script>
        <script src="/assets/lib/counters.js"></script>

        <style type="text/css">
            body {
                overflow: hidden;
            }

            .container-full {
                margin: 0 auto;
                padding-left: 1em;
                width: 95%;
            }

            .page-header {
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

            /* Build details */

            #buildDetails {
                bottom: 0;
                left: 50px;

                width: 400px;
                height: 300px;
            }

            #buildDetails.shy {
                bottom: -240px;
            }

            #buildDetails .page-header {
                background-color: rgb(174, 199, 59);
            }



            /* Test reports */

            #testReport {
                top: 20px;
                right: 30px;

                width: 1200px;
                height: 600px;
            }

            #testReport.shy {
                top: -540px;
                right: -600px;
            }

            #testReport #fullTestReport {
                margin: 0.5em 1em;
                height: 530px;
                overflow: auto;
                overflow-x: hidden;
            }

            #fullTestReport .package-name {
                font-family: 'Ubuntu Mono', monospace;
                font-weight: bold;
                font-size: 1.4em;
                margin-top: 2em;
            }

            #fullTestReport .test-package.fail .package-name {
                color: rgb(244, 117, 51);
            }

            #fullTestReport .test-class.fail .class-name {
                color: rgb(244, 117, 51);
            }

            #fullTestReport .class-name {
                font-family: 'Ubuntu Mono', monospace;
                font-weight: bold;
                font-size: 1.3em;
            }

            #fullTestReport .test-name {
                font-family: 'Ubuntu Mono', monospace;
                font-size: 1.1em;
            }

            #fullTestReport .individual-tests {
                padding-left: 0.5em;
                font-size: 0.9em;
            }

            #fullTestReport .individual-tests.success {
                display: none;
            }

            #fullTestReport .individual-tests.show-successful {
                display: block;
            }

            #fullTestReport .individual-tests.success {
                border-left: 5px solid rgb(202, 215, 94);
            }
            #fullTestReport .individual-tests.fail {
                border-left: 5px solid rgb(244, 117, 51);
            }
            #fullTestReport .individual-tests.skipped {
                border-left: 5px solid rgb(244, 229, 69);
            }

            #fullTestReport h4 .glyphicon {
                font-size: 0.9em;
            }



            #fullTestReport .individual-test.success {

            }
            #fullTestReport .individual-test.fail {
                font-weight: bold;
                color: rgb(244, 117, 51);
            }

            #fullTestReport pre {
                font-family: "Ubuntu Mono", monospace;
                font-size: 0.9em;
                width: 9p%;
            }

            #testReport .filter-container {
                margin: 0.5em;
                padding: 0.5em;
                height: 525px;
                background-color: #fafafa;
            }




            /* Task panel */

            #taskPanel {
                left: -2px;
                top: -2px;
                width: 10px;

                height: calc(100% + 4px);

                box-shadow: 0 0 15px rgba(50, 50, 50, 0.5);
                background-color: #242320;

                color: rgb(201, 208, 194);

                border-right: 2px solid #222;
            }


            #taskStack {
                height: 100%;
                width: 100%;
                overflow: hidden;
            }





            /* Output */

            #gradleOutput {
                top: -2px;
                right: -10px;

                width: 60%;
                height: calc(100% + 4px);

                box-shadow: inset 6px 0px 23px -2px rgba(0,0,0,1);
                background-color: #242320;

                color: rgb(201, 208, 194);

                border-left: 2px solid #222;
            }

            #gradleOutput.shy {
                right: -500px;
            }

            #gradleOutput .output-container {
                font-family: "Ubuntu Mono", monospace;
                height: 100%;
                width: 99%;
                overflow: auto;
            }


            /* Counters */

            .counter-container h3 {
                font-family: 'Architects Daughter', cursive;
                margin-left: 1em;
            }




            /* Running tasks */

            #tasksScene2 .task-running {
                font-family: 'Oswald', sans-serif;
                opacity: 1;

                transition-property: opacity;
                transition-duration: 0.3s;
            }

            #tasksScene2 .task-running.done {
                opacity: 0;
            }

            #tasksScene2 .task-running h3 {
                font-size: 1.0em;
                font-weight: bold;
                margin-bottom: 2px;
            }

            #tasksScene2 .task-running p {
                font-size: 0.8em;
            }

            #tasksScene2 .task-progress-bar {
                background-color: #555;
                width: 300px;
                height: 3px;

                transition-property: width;
            }

            #tasksScene2 .task-progress-bar.started {
                width: 0px;
            }


            /* Counter panel */

            #counterPanel {
                position: absolute;
                width: 1400px;
                left: 50px;
                bottom: 80px;
            }


            /* Settings */

            #buildDetailsContainer td,th {
                border-top: 0;
            }

            .setting-property .key {
                padding-left: 1em;
                font-weight: bold;
                color: #444;
            }

            .setting-property .value {
                color: #888;
            }
        </style>
    </head>
    <body>



        <div class="container container-full">
            <div class="row">
                <div id="headerRow" class="col-md-12">
                    <div class="page-header">
                        <h1>#${buildNumber} <span class="project-name">Waiting for project name...</span> <small>./gradlew ${commandLine}</small></h1>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-md-6">
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

                <div class="col-md-3 counter-container">
                    <h3>Executed tests</h3>
                    <div id="testCounter"></div>
                </div>
            </div>
        </div>












        <!-- Tasks -->
        <div id="taskPanel" class="moving-panel shy">
            <div id="taskStack"></div>
        </div>


        <!-- Gradle output -->
        <div id="gradleOutput" class="moving-panel shy">
            <div class="output-container"></div>
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

        <!-- Tests -->
        <div id="testReport" class="moving-panel upside-down shy hidden">
            <div class="page-header">
                <hr/>
                <h3><u>T</u>est report <small> - Awaiting test results..</small></h3>
            </div>

            <div class="test-container">
                <div class="row">
                    <div class="col-md-3">
                        <div class="filter-container form-group">
                            <h2>Filter</h2>
                            <hr/>

                            <div class="checkbox">
                                <label>
                                    <input type="checkbox" id="showSuccessfulTests"> Show successful
                                </label>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-9">
                        <div id="fullTestReport"></div>
                    </div>
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
                var ws = new WebSocket("ws://localhost:8080/ws/build");



                var pubsub = (function() {
                    var bus = new Bacon.Bus();

                    // Create a stream of simple keyboard commands
                    $(document).keydown(function(event) {
                        var key = String.fromCharCode(event.keyCode);
                        bus.push({type: "key-down-" + key, event: {}})
                    });

                    // Dead simple pubsub event-bus with reactive
                    // capabilities provided by Bacon.js
                    return {
                        broadcast: function(event) {
                            bus.push(event);
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
                // createTestReport(pubsub);
                createTaskPanel(pubsub);

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
