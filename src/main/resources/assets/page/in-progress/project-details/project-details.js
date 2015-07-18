var createProjectDetails = function(pubsub) {
    "use strict";

    var hasProperty = function(property, expected) {
        return function(event) {
            return event.hasOwnProperty(property) && event[property] === expected;
        }
    };

    function createTemplate(selector) {
        _.templateSettings.variable = "root";
        var $el = $(selector);
        return _.template($el.html());
    }

    var $projectDetails = $("#projectDetails");



    $(document).ready(function() {
        $(".inner-container").css("height", $(window).height() + "px");
    });




    /**
     * Append tasks to projects
     */
    (function() {
        var taskDetailTemplate = createTemplate("#taskDetailTemplate");

        var findProjectContainer = function(path) {
            return $projectDetails.find(".project-detail[data-project='"+path+"']");
        };

        var appendTaskDetails = function(task) {
            var $project = findProjectContainer(task.projectPath);
            var $tasks = $project.find(".project-tasks");

            var $taskDetails = $(taskDetailTemplate(task));
            $taskDetails.appendTo($tasks);

            var remainingTasks = parseInt($project.attr("data-remaining-tasks")) + 1;
            $project.attr("data-remaining-tasks", remainingTasks);
        };

        var removeProjectsWithoutTasks = function() {
            $projectDetails.find(".project-detail").each(function(i, el) {
                var $el = $(el);
                if ($el.find(".task-details").length == 0) {
                    $el.remove();
                }
            });
        };


        pubsub.takeOne("TaskGraphReady")
            .map(".tasks")
            .onValue(function(tasks) {
                tasks.forEach(appendTaskDetails);
                removeProjectsWithoutTasks();
            });
    })();


    /**
     * Start tasks
     */
    (function() {
        var findTaskContainer = function(path) {
            return $projectDetails.find(".task-details[data-task='"+path+"']");
        };

        pubsub.stream("TaskStarting")
            .onValue(function (event) {
                var $el = findTaskContainer(event.path);
                $el.find(".task-icon")
                    .removeClass("glyphicon-record")
                    .addClass("glyphicon-question-sign")
                    .attr("title", "Execution started");

                $el.addClass("running");
            });
    })();

    /**
     * Completing tasks
     */
    (function() {
        var findTaskContainer = function(path) {
            return $projectDetails.find(".task-details[data-task='"+path+"']");
        };

        pubsub.stream("TaskCompleted")
            .onValue(function (event) {
                var $task = findTaskContainer(event.path);
                var $project = $task.parents(".project-detail");

                $task.find(".task-icon")
                    .removeClass("glyphicon-question-sign")
                    .addClass("glyphicon-ok-sign")
                    .attr("title", "Executed successfully");

                if (event.failureMessage != null) {
                    $task.addClass("failed");

                    $task.find(".task-icon")
                        .removeClass("glyphicon-ok-sign")
                        .addClass("glyphicon-remove-sign")
                        .attr("title", "Failure: " + event.failureMessage);


                    $project.add("class", "contains-failed-task");
                }

                if (event.skipped) {
                    $task.addClass("skipped");

                    $task.find(".task-icon")
                        .removeClass("glyphicon-question-sign")
                        .addClass("glyphicon-minus-sign")
                        .attr("title", "Skipped: " + event.skippedMessage);

                    $project.add("class", "contains-skipped-task");
                }

                $task.removeClass("running");
                $task.addClass("completed");



                // Duration

                (function() {
                    $task.find(".duration").html(" - " + event.durationMillis + " ms");
                })();



                // Mark projects where all tasks has completed

                (function() {
                    var remainingTasks = parseInt($project.attr("data-remaining-tasks")) - 1;
                    $project.attr("data-remaining-tasks", remainingTasks);

                    if (remainingTasks === 0) {
                        $project.addClass("tasks-completed")
                    }
                })();
            });
    })();




    (function() {
        pubsub.takeOne("TaskGraphReady")
            .map(".tasks")
            .flatMap(Bacon.fromArray)
            .onValue(function(task) {
                var $task = $projectDetails.find(".task-details[data-task='"+ task.path +"']");

                var testSummary = {
                    started: 0,
                    completed: 0,

                    success: 0,
                    skipped: 0,
                    failure: 0
                };


                var taskCompleted = pubsub.stream("TaskCompleted")
                    .filter(hasProperty("path", task.path))
                    .take(1);

                taskCompleted.onValue(function () {
                });


                pubsub.stream("TestStarted")
                    .filter(hasProperty("taskPath", task.path))
                    .takeUntil(taskCompleted)
                    .onValue(function(started) {
                        testSummary.started++;

                        pubsub.stream("TestCompleted")
                            .filter(hasProperty("className", started.className))
                            .filter(hasProperty("name", started.name))
                            .take(1)
                            .onValue(function (completed) {
                                testSummary.started++;

                                if (completed.result === "SUCCESS") {
                                    testSummary.success++;

                                    $task.find(".test-success-count")
                                        .removeClass("hidden")
                                        .html(testSummary.success);
                                }
                                if (completed.result === "SKIPPED") {
                                    testSummary.skipped++;

                                    $task.find(".test-skipped-count")
                                        .removeClass("hidden")
                                        .html(testSummary.skipped);
                                }
                                if (completed.result === "FAILURE") {
                                    testSummary.failure++;

                                    $task.find(".test-failure-count")
                                        .removeClass("hidden")
                                        .html(testSummary.failure);
                                }
                            });
                    });




            });
    })();





    (function() {
        var taskGraphReady = pubsub.takeOne("TaskGraphReady");
        var buildCompleted = pubsub.takeOne("GradleBuildCompleted");
        var projectDetailsTemplate = createTemplate("#projectDetailTemplate");

        pubsub.stream("ProjectEvaluated")
            .takeUntil(taskGraphReady)
            .onValue(function (projectEvaluated) {
                var $projectElement = $(projectDetailsTemplate(projectEvaluated));
                $projectElement.appendTo($projectDetails);



                var summary = {
                    total: -1,
                    started: 0,
                    completed: 0,
                    running: 0
                };

                var toggleClasses = function() {
                    $projectElement.toggleClass("task-running", (summary.started - summary.completed) > 0);
                };

                pubsub.takeOne("TaskGraphReady")
                    .map(".tasks")
                    .flatMap(Bacon.fromArray)
                    .filter(hasProperty("projectPath", projectEvaluated.path))
                    .onValue(function(definedTask) {
                        summary.total++;
                    });

                pubsub.stream("TaskStarting")
                    .takeUntil(buildCompleted)
                    .filter(hasProperty("projectPath", projectEvaluated.path))
                    .onValue(function(taskStarted) {
                        summary.started++;
                        toggleClasses();

                        pubsub.stream("TaskCompleted")
                            .filter(hasProperty("path", taskStarted.path))
                            .take(1)
                            .onValue(function () {
                                summary.completed++;
                                toggleClasses();
                            });
                    });
            });

    })();


};