function createRunningTasks(pubsub) {
    "use strict";



    var $tasksScene2 = $("#tasksScene2");

    var taskData = [ ];
    var taskDataMap = { };

    pubsub.stream("TaskGraphReady")
        .map(".tasks")
        .onValue(function(tasks) {
            taskData = tasks;
            taskData.forEach(function(task) {
                taskDataMap[task.path] = task;
            });
        });


    pubsub.stream('tasks-estimated')
        .onValue(function (tasks) {
            tasks.forEach(function(estimatedTask) {
                taskDataMap[estimatedTask.path].estimateMillis = estimatedTask.estimateMillis;
            });
        });

    pubsub.stream("TaskStarting")
        .onValue(function (event) {
            var task = taskDataMap[event.path];
            var description = task.description != null ? task.description : "No description";

            if (task.estimateMillis != null) {
                description += "<span class='estimate'>Estimate: " + (Math.ceil(task.estimateMillis / 1000)) + " seconds.</span>";
            }

            var $el = $("<div class='task-running'><h3>" + task.path + "</h3><div class='task-progress-bar hidden'></div><p class='description'>" + description + "</p></div>");
            $el.appendTo($tasksScene2);


            if (task.estimateMillis != null) {
                if (task.estimateMillis < 500) {
                    $el.addClass("hidden"); // Never display really short lived tasks (visual noise)
                }

                $el.find(".task-progress-bar")
                    .removeClass("hidden")
                    .css("transition", "width " + task.estimateMillis + "ms");

                setTimeout(function() {
                    $el.find(".task-progress-bar").addClass("started");
                }, 10);
            }

            taskDataMap[event.path].$el = $el;
        });

    pubsub.stream("TaskCompleted")
        .onValue(function (task) {
            var $el = taskDataMap[task.path].$el;

            if (task.failureMessage != null) {
                $el.removeClass("hidden")
                    .addClass("finished")
                    .addClass("failed")
                    .find(".description")
                        .html(task.failureMessage);
            }
            else {
                $el.addClass("finished").addClass("success");
                setTimeout(function() {
                    $el.remove();
                }, 300);
            }
        });

}