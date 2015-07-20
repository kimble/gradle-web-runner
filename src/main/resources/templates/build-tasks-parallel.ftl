<#-- @ftlvariable name="" type="com.developerb.gviz.exec.ExecResource.TaskParallelReportView" -->
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>Gradle Web Runner - Build - ${buildNumber} - Tasks</title>


        <link rel="stylesheet" href="/assets/mdl/material.min.css">
        <link href="/assets/bootstrap/css/bootstrap.min.css" rel="stylesheet">

        <script src="/assets/jquery/jquery-2.1.4.min.js"></script>
        <script src="/assets/bacon/bacon.js"></script>
        <script src="/assets/d3/d3.min.js"></script>

        <script src="/assets/page/pubsub.js"></script>
        <script src="/assets/page/build-websockets.js"></script>
        <script src="/assets/page/parallel-tasks/parallel-tasks.js"></script>

        <link href='http://fonts.googleapis.com/css?family=Oswald:400,700,300' rel='stylesheet' type='text/css'>
        <link href='http://fonts.googleapis.com/css?family=Architects+Daughter' rel='stylesheet' type='text/css'>

        <style type="text/css">
            body {
                width: 100%;
                font-family: Oswald, sans-serif;
            }

            .container {
                margin: 0 auto;
                width: 100%;
            }

            #scene {
                margin: 0;
                font-family: 'Architects Daughter', cursive;
            }
            .task rect:hover {
                box-shadow: 0 0 4px rgba(0,0,0,0.2);
            }
            .task {
                transition: all 0.15s ease-in-out;
                opacity: 1;
                cursor: pointer;
            }
            .task-info {
                font-family: 'Architects Daughter', cursive;
                opacity: 0;
            }
            .task-info.active {
                transition: all 0.15s ease-in-out;
                opacity: 1;
            }
            .blurred {
                opacity: 0.04;
                fill: gray;
            }
            .focused {
                strok-width: 4;
            }
            .task text {
            }
            .axis path, .axis line {
                fill: none;
                stroke: #aaa;
                shape-rendering: crispEdges;
                stroke-width: 2;
            }
            .axis text {
                font-weight: bold;
                font-size: 15px;
            }
            #scene {
                margin-top: 2em;
            }
            #projectName small {
                font-family: monospace;
            }
            #startedTasks {
                font-family: monospace;
            }
            #footer {
                margin-top: 4em;
                font-size: 1.2em;
                font-family: 'Architects Daughter', cursive;
                text-align: right;
            }
            #footer a {
                color: #aaa;
            }
        </style>
    </head>
    <body>



        <div class="container container-full">
            <div class="row">
                <div id="headerRow" class="col-md-12">
                    <h1>#${buildNumber} - Parallel task execution - <span class="project-name">Waiting for project name...</span> <br/> <small>./gradlew ${commandLine}</small></h1>
                </div>
            </div>
        </div>


        <div id="scene"></div>

        <div id="footer" class="col-md-12">
            <p><a href="http://developer-b.com">www.developer-b.com</a></p>
        </div>





        <script type="text/javascript">
            (function() {
                "use strict";

                var buildNumber = ${buildNumber};

                // Interface
                createParallelTasks(pubsub);

                // Connect to websocket
                streamBuildEvents(pubsub, buildNumber);


            })();
        </script>

    </body>
</html>
