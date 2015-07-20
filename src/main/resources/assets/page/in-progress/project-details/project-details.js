var createProjectDetails = function(pubsub, buildNumber) {
    "use strict";



    $(document).ready(function() {
        $(".inner-container").css("height", $(window).height() + "px");
    });


    pubsub.stream("key-down-H").onValue(function() {
        $("#projectDetails").toggleClass("hide-successful");
    });

    pubsub.takeOne("GradleBuildCompleted")
        .onValue(function() {
            $("#projectDetails").removeClass("hide-successful");
        });


    var data = (function() {
        var bus = new Bacon.Bus();

        var projects = { };
        var tasks = { };

        var hasTask  = function(path) {
            return tasks.hasOwnProperty(path);
        };

        var getTask = function(path) {
            if (hasTask(path)) {
                return tasks[path];
            }
            else {
                throw "Unknown task: " + path;
            }
        };

        var pushState = function() {
            bus.push({
                projects: _.values(projects)
            })
        };

        return {
            evaluateProject : function(event) {
                projects[event.path] = {
                    path: event.path,
                    name: event.name,
                    description: null, // After evaluation

                    taskCount: 0,
                    completedTasks: 0,
                    runningTasks: 0,
                    remainingTasks: 0,
                    failedTasks: 0,

                    tasks: [ ],
                    evaluating: true
                };

                pushState();
            },

            projectEvaluated : function(event) {
                projects[event.path].evaluating = false;
                projects[event.path].description = event.description;

                pushState();
            },

            addTasks : function(addedTasks) {
                addedTasks.forEach(function(task) {
                    var taskState = {
                        projectPath : task.projectPath,

                        path: task.path,
                        type: task.type,
                        name: task.name,
                        description: task.description,

                        estimateMillis: null,
                        startedLocalTime: null,

                        waiting: true,
                        running: false,
                        skipped: false,
                        failed: false,
                        success: false,
                        completed: false,

                        testSummary: {
                            started: 0,
                            completed: 0,
                            skipped: 0,
                            failure: 0,
                            success: 0
                        },

                        testClasses: { },
                        tests: [ ]
                    };

                    var project = projects[task.projectPath];

                    project.taskCount++;
                    project.remainingTasks++;
                    project.tasks.push(taskState);

                    tasks[task.path] = taskState;
                });

                pushState();
            },

            taskStarted : function(event) {
                var task = tasks[event.path];
                var project = projects[task.projectPath];

                task.startedLocalTime = new Date().getTime();
                task.running = true;
                task.waiting = false;

                project.runningTasks++;

                pushState();
            },

            taskCompleted: function(event) {
                var task = tasks[event.path];
                var project = projects[task.projectPath];

                task.running = false;
                task.completed = true;

                task.durationMillis = event.durationMillis;

                task.skipped = event.skipped;
                task.success = event.success;
                task.failure = event.failure;
                task.didWork = event.didWork;

                task.skippedMessage = event.skippedMessage;
                task.failureMessage = event.failureMessage;
                task.failureStacktrace = event.failureStacktrace;

                project.runningTasks--;
                project.remainingTasks--;
                project.completedTasks++;

                if (task.failure === true) {
                    project.failedTasks++;
                }

                pushState();
            },

            estimatesArrived : function(estimates) {
                Object.keys(estimates).forEach(function (key) {
                    if (hasTask(key)) {
                        var task = getTask(key);
                        task.estimateMillis = estimates[key];
                    }
                });

                pushState();
            },

            testStarted : function(event) {
                var task = tasks[event.taskPath];
                var taskTestClasses = task.testClasses;

                if (!taskTestClasses.hasOwnProperty(event.className)) {
                    taskTestClasses[event.className] = { };
                }

                var testState = {
                    className: event.className,
                    name: event.name,

                    output: null,
                    durationMillis: null,
                    exceptionMessage: null,
                    exceptionStacktrace: null
                };

                taskTestClasses[event.className][event.name] = testState;


                task.tests.push(testState);
                task.testSummary.started++;

                // pushState();
            },

            testCompleted : function(event) {
                var task = tasks[event.taskPath];
                var taskTestClasses = task.testClasses;
                var tests = taskTestClasses[event.className];
                var test = tests[event.name];

                test.output = event.output;
                test.durationMillis = event.durationMillis;
                test.exceptionMessage = event.exceptionMessage;
                test.exceptionStacktrace = event.exceptionStacktrace;

                test.success = event.result === "SUCCESS";
                test.skipped = event.result === "SKIPPED";
                test.failure = event.result === "FAILURE";

                task.testSummary.completed++;

                if (test.success) {
                    task.testSummary.success++;
                }
                if (test.skipped) {
                    task.testSummary.skipped++;
                }
                if (test.failure) {
                    task.testSummary.failure++;
                }

                pushState();
            },


            stream : bus
        };
    })();

    var taskGraphReady = pubsub.takeOne("TaskGraphReady");
    var buildCompleted = pubsub.takeOne("GradleBuildCompleted");

    pubsub.stream("ProjectEvaluationStarted")
        .takeUntil(taskGraphReady)
        .assign(data, "evaluateProject");

    pubsub.stream("ProjectEvaluated")
        .takeUntil(taskGraphReady)
        .assign(data, "projectEvaluated");

    pubsub.stream("TaskStarting")
        .takeUntil(buildCompleted)
        .assign(data, "taskStarted");

    pubsub.stream("TaskCompleted")
        .takeUntil(buildCompleted)
        .assign(data, "taskCompleted");

    pubsub.stream("TestStarted")
        .takeUntil(buildCompleted)
        .assign(data, "testStarted");

    pubsub.stream("TestCompleted")
        .takeUntil(buildCompleted)
        .assign(data, "testCompleted");

    pubsub.takeOne("estimates-received")
        .takeUntil(buildCompleted)
        .assign(data, "estimatesArrived")


    taskGraphReady.map(".tasks").assign(data, "addTasks");



    var prop = function(name) {
        return function(obj) {
            return obj[name];
        };
    };

    var formatMilliseconds = function(milliseconds) {
        if (milliseconds < 5000) {
            return milliseconds + " ms";
        }
        else {
            return Math.round(milliseconds / 1000) + " sec";
        }
    };

    (function() {
        var pd = d3.select("#projectDetails");

        data.stream.throttle(1000).onValue(function (state) {
            var projectDetails = pd.selectAll(".project-detail")
                .data(state.projects, prop("path"));





            // Enter project

            var enterProject = projectDetails.enter()
                .append("div")
                .attr("class", "project-detail");



            // Enter project header


            var enterProjectHeader = enterProject.append("div")
                .attr("class", "page-header");


            enterProjectHeader.append("h3")
                .attr("class", "header");

            enterProjectHeader.append("small")
                .attr("class", "project-path")
                .text(prop("path"))
                .append("br");

            enterProjectHeader.append("span")
                .attr("class", "project-name")
                .text(prop("name"));

            enterProjectHeader.append("div")
                .attr("class", "project-info")
                .attr("title", "Evaluating...")
                .text("E");

            // Enter project description

            enterProject.append("blockquote")
                .attr("class", "project-description");

            // Enter task container

            enterProject.append("div").attr("class", "project-tasks");


            // Update project classes

            projectDetails.classed("evaluating", prop("evaluating"))
                .classed("success", function(project) {
                    return project.remainingTasks === 0 && project.failedTasks === 0;
                })
                .classed("hidden", function(project) {
                    return project.tasks.length === 0;
                });



            // Update description (available after project evaluation)

            projectDetails.select(".project-description")
                .classed("hidden", function(p) { return p.description == null; })
                .text(prop("description"));


            // Update project info

            projectDetails.select(".project-info")
                .classed("running", function(p) {
                    return p.runningTasks > 0;
                })
                .classed("failed", function(p) {
                    return p.failedTasks > 0;
                })
                .classed("completed", function(p) {
                    return p.remainingTasks === 0;
                })
                .classed("success", function(p) {
                    return p.remainingTasks === 0 && p.failedTasks === 0;
                })
                .attr("title", function(project) {
                    if (project.runningTasks > 0) {
                        return "Running: " + project.runningTasks;
                    }
                    else if (project.failedTasks > 0) {
                        return project.failedTasks + " failed task(s)";
                    }
                    else if (project.remainingTasks === 0 && project.failedTasks === 0) {
                        return project.completedTasks + " task(s) completed successfully";
                    }
                    else if (project.remainingTasks > 0) {
                        return project.remainingTasks + " task(s) remaining";
                    }
                    else {
                        return "?";
                    }
                })
                .text(function(project) {
                    if (project.runningTasks > 0) {
                        return "R";
                    }
                    else if (project.failedTasks > 0) {
                        return project.failedTasks + " F";
                    }
                    else if (project.remainingTasks === 0 && project.failedTasks === 0) {
                        return "OK";
                    }
                    else if (project.remainingTasks > 0) {
                        return project.remainingTasks + " R";
                    }
                    else {
                        return "?";
                    }
                });


            // Tasks

            var projectTasks = projectDetails.select(".project-tasks")
                .selectAll(".task-details")
                .data(prop("tasks"), prop("path"));



            // Enter project tasks

            var enterTask = projectTasks.enter()
                .append("div")
                .attr("class", "task-details");

            var enterTaskFirstLine = enterTask.append("div");
            var enterTaskSecondLine = enterTask.append("div");

            enterTaskSecondLine.append("div")
                .attr("class", "summary hidden");

            var enterTaskIcons = enterTaskFirstLine.append("span")
                .attr("class", "icons");

            var addIcon = function(name, icon, title) {
                enterTaskIcons.append("span")
                    .attr("class", "task-icon-" + name + " glyphicon glyphicon-" + icon)
                    .attr("title", title);
            };

            addIcon("waiting", "record", "Waiting..");
            addIcon("running", "cog", "Running...");
            addIcon("success", "ok-sign", "Success");
            addIcon("skipped", "minus-sign", "Skipped");
            addIcon("failure", "remove-sign", "Failure");

            enterTaskFirstLine.append("span")
                .attr("class", "task-name")
                .attr("title", prop("name"))
                .text(function(task) {
                    return _.trunc(task.name, 25);
                });


            enterTaskFirstLine.append("span")
                .attr("title", "Successful tests")
                .attr("class", "hidden label label-success test-success-count");

            enterTaskFirstLine.append("span")
                .attr("title", "Skipped tests")
                .attr("class", "hidden label label-warning test-skipped-count");

            enterTaskFirstLine.append("span")
                .attr("title", "Failed tests")
                .attr("class", "hidden label label-danger test-failure-count")
                .each(function(task) {
                    $(this).popover({
                        title: task.path,
                        html: true,
                        content: function() {
                            var allTests = task.tests;
                            var failedTests = allTests.filter(function (test) {
                                return test.failure === true;
                            });

                            return failedTests.map(function(test) {
                                return '<div class="test-summary failed">' +
                                    '<div class="page-header"><h3><small>' + test.className + '</small><br>' + test.name + '</h3></div>' +
                                    '<div class="test-exception-message">' + test.exceptionMessage + '</div>' +
                                    '<pre>' + test.exceptionStacktrace + '</pre>' +
                                    '</div>';
                            }).join("");
                        }
                    });
                });


            enterTaskFirstLine.append("span")
                .attr("class", "duration hidden");


            // Update task duration

            projectTasks.select(".duration")
                .classed("hidden", function(task) {
                    return task.durationMillis == null && task.estimateMillis == null;
                })
                .text(function(task) {
                    if (task.durationMillis != null) {
                        return formatMilliseconds(task.durationMillis);
                    }
                    else if (task.estimateMillis != null) {
                        if (task.running) {
                            var now = new Date().getTime();
                            var elapsed = now - task.startedLocalTime;
                            var remaining = task.estimateMillis - elapsed;

                            if (remaining > 0) {
                                return " ~" + formatMilliseconds(remaining);
                            }
                            else {
                                return " ~" + formatMilliseconds(Math.abs(remaining)) + " over estimate";
                            }
                        }
                        else {
                            return "~ " + formatMilliseconds(task.estimateMillis);
                        }
                    }
                });

            // Update task status

            projectTasks.classed("waiting", prop("waiting"))
                .classed("running", prop("running"))
                .classed("skipped", prop("skipped"))
                .classed("success", prop("success"))
                .classed("failure", prop("failure"))
                .classed("completed", prop("completed"));


            // Update test summary

            projectTasks.select(".test-success-count")
                .classed("hidden", function(test) {
                    return test.testSummary.success === 0;
                })
                .text(function(test) {
                    return test.testSummary.success;
                });

            projectTasks.select(".test-skipped-count")
                .classed("hidden", function(test) {
                    return test.skipped.success === 0;
                })
                .text(function(test) {
                    return test.skipped.success;
                });

            projectTasks.select(".test-failure-count")
                .classed("hidden", function(test) {
                    return test.testSummary.failure === 0;
                })
                .text(function(test) {
                    return test.testSummary.failure;
                });


            // Update task summary

            projectTasks.select(".summary")
                .classed("hidden", function (task) {
                    return task.failure !== true;
                })
                .text(prop("failureMessage"))
                .each(function(task) {
                    if (task.failureStacktrace != null) {
                        $(this).popover({
                            title: task.path,
                            html: true,
                            content: function() {
                                return "<pre>" + task.failureStacktrace + "</pre>";
                            }
                        });
                    }
                });

        });
    })();


};