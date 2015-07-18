function initializeTaskState(pubsub, buildNumber) {
    var tasks = [];
    var mapping = {};



    function isBlocked(task) {
        for (var i in task.dependsOn) {
            if (task.dependsOn.hasOwnProperty(i)) {
                var dependencyPath = task.dependsOn[i];
                var dependency = mapping[dependencyPath];
                if (!dependency.hasCompleted) {
                    return true;
                }
            }
        }

        return false;
    }

    function broadcastStateUpdate() {
        for (var index in tasks) {
            if (tasks.hasOwnProperty(index)) {
                var task = tasks[index];
                task.isBlocked = isBlocked(task);
                task.isReady = !task.hasCompleted && !task.isRunning && !task.isBlocked;
                task.shortendPath = task.path.length > 30 ? "..." + task.path.substring(task.path.length - 30) : task.path;
            }
        }

        pubsub.broadcast({ type: 'task-state-update', event: tasks });
    }


    function fetchEstimates() {
        jQuery.getJSON("/api/build/" + buildNumber + "/estimates", function(estimates) {
            pubsub.broadcast('estimates-received', estimates);

            for (var key in estimates) {
                if (estimates.hasOwnProperty(key)) {
                    if (mapping.hasOwnProperty(key)) {
                        var task = mapping[key];
                        task.estimateMillis = estimates[key];
                    }
                }
            }

            pubsub.broadcast('tasks-estimated', tasks);
            broadcastStateUpdate();
        });
    }


    pubsub.stream("TaskGraphReady")
        .onValue(function(event) {
            event.tasks.forEach(function(task) {

                task.isRunning = false;
                task.hasCompleted = false;
                task.estimateMillis = null;

                mapping[task.path] = task;
                tasks.push(task);
            });
            
            broadcastStateUpdate();
            fetchEstimates();
        });


    pubsub.stream("TaskStarting")
        .onValue(function(event) {
            var task = mapping[event.path];
            task.startedAt = event.timestamp;
            task.isRunning = true;


            broadcastStateUpdate();
        });


    pubsub.stream("TaskCompleted")
        .onValue(function(event) {
            var task = mapping[event.path];

            task.isRunning = false;
            task.hasCompleted = true;

            task.didWork = event.didWork;
            task.skipped = event.skipped;
            task.skippedMessage = event.skippedMessage;
            task.failureMessage = event.failureMessage;
            task.durationMillis = event.durationMillis;

            broadcastStateUpdate();
        });



    (function() {
        var foldProjects = function (state, event) {
            return state.set(event.path, Immutable.fromJS({
                path: event.path,
                name: event.name,
                description: event.description,
                parent: event.parentPath,
                children: event.childrenPaths
            }));
        };

        pubsub.stream("ProjectEvaluated")
            .takeUntil(pubsub.takeOne("TaskGraphReady"))
            .fold(Immutable.Map({ }), foldProjects)
            .assign(pubsub, "broadcast", "project-data-assembled");
    })();





    (function() {
        var combineTasksAndProjects = function(projectMap, tasks) {
            return tasks.map(function (task) {
                var taskProjectPath = task.get("projectPath");
                var project = projectMap.get(taskProjectPath);

                return task.set("project", project);
            });
        };

        var projectData = pubsub.takeOne("project-data-assembled");
        var taskData = pubsub.takeOne("TaskGraphReady").map(".tasks").map(Immutable.fromJS);

        Bacon.combineWith(combineTasksAndProjects, projectData, taskData)
            .log("Combined tasks and projects");
    })();


}