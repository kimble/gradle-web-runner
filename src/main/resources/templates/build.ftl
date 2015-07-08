<#-- @ftlvariable name="" type="com.developerb.gviz.exec.ExecResource.BuildView" -->
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>G-Viz - Build - ${buildNumber}</title>

        <link href="/assets/bootstrap/css/bootstrap.min.css" rel="stylesheet">
        <script src="/assets/jquery/jquery-2.1.4.min.js"></script>
        <script src="/assets/d3/d3.min.js"></script>

        <style type="text/css">
            .container-full {
                margin: 0 auto;
                width: 95%;
            }

            #headerRow {
                margin-top: 4em;
            }

            #taskList {
                text-align: center;
            }

            .task {
                display: inline-block;
                margin: 4px 8px;

                transition: color 0.9s ease;
            }

            .task h2 {
                font-family: Ubuntu, monospace;
                font-size: 0.9em;
                margin: 0;
                font-weight: bold;
            }

            .task .running-icon,.blocked-icon,.completed-icon,.candidate-icon {
                display: none;
            }

            .task .glyphicon {
                font-size: 0.9em;
                padding-right: 3px;
            }


            /* Blocked */

            .task.blocked {
                color: #777;
            }

            .task.blocked .blocked-icon {
                display: inline;
            }


            /* Candidate (not blocked) */

            .task.candidate {

            }

            .task.candidate .candidate-icon {
                display: inline;
            }

            /* Running */

            .task.running {
                font-weight: bold;
            }

            .task.running .running-icon {
                display: inline;
            }

            /* Completed */

            .task.completed {

            }

            .task.completed .completed-icon {
                display: inline;
            }
        </style>
    </head>

    <body>

        <div class="container container-full">
            <div class="row">
                <div id="headerRow" class="col-md-12">
                    <div class="page-header">
                        <h1>#${buildNumber} <span id="projectName">Loading data...</span></h1>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-md-12">
                    <div id="taskList"></div>
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


                var $elements = {
                    projectName: $("#projectName")
                };

                var d3roots = {
                    taskList: d3.select("#taskList")
                };

                function poll() {
                    d3.json("/api/build/" + buildNumber + "/state", function(error, json) {
                        if (error) {
                            console.warn(error);
                            return;
                        }

                        updateView(json);
                    });
                }

                function updateView(data) {
                    console.log("Updating view", data);

                    $elements.projectName.html(data.projectName);


                    var tasks = d3roots.taskList.selectAll(".task")
                            .data(data.tasks, namedAttr("path"));

                    var enterTaskGroup = tasks.enter()
                            .append("div")
                            .attr("class", "task");

                    var header = enterTaskGroup.append("h2");

                    header.append("span").attr("class", "completed-icon glyphicon glyphicon-ok-sign");
                    header.append("span").attr("class", "candidate-icon glyphicon glyphicon-time");
                    header.append("span").attr("class", "running-icon glyphicon glyphicon-play-circle");
                    header.append("span").attr("class", "blocked-icon glyphicon glyphicon-pause");

                    header.append("span").text(namedAttr("path"));


                    // ENTER + UPDATE

                    function getTask(path) {
                        for (var i in data.tasks) {
                            var task = data.tasks[i];
                            if (task.path === path) {
                                return task;
                            }
                        }

                        throw "No task with path " + path
                    }


                    function hasCompleted(t) { return t.duration != null; }
                    function hasStarted(t) { return t.started != null; }
                    function isRunning(t) { return hasStarted(t) && !hasCompleted(t); }



                    function isBlocked(task) {
                        for (var i in task.dependsOn) {
                            var dependencyPath = task.dependsOn[i];
                            var dependency = getTask(dependencyPath);
                            if (!hasCompleted(dependency)) {
                                return true;
                            }
                        }

                        return false;
                    }

                    function isCandidate(t) { return !hasCompleted(t) && !hasStarted(t) && !isBlocked(t); }

                    tasks.classed("started", hasStarted)
                        .classed("completed", hasCompleted)
                        .classed("candidate", isCandidate)
                        .classed("blocked", isBlocked)
                        .classed("running", isRunning);


                }








                poll();
                setInterval(poll, 1000 * 1);

            })();
        </script>

    </body>
</html>
