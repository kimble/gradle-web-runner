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

            // var css = "width: 300px; transition: width " + task.estimateMillis + "ms;";

            var $el = $("<div class='task-running'><h3>" + task.path + "</h3><div class='task-progress-bar hidden'></div><p>" + description + "</p></div>");
            $el.appendTo($tasksScene2);


            if (task.estimateMillis != null) {
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
                $el.addClass("finished").addClass("failed");
            }
            else {
                $el.addClass("finished").addClass("success");
                setTimeout(function() {
                    $el.remove();
                }, 300);
            }
        });

}