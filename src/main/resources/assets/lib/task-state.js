function initializeTaskState(pubsub) {
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



    pubsub.stream("TaskGraphReady")
        .onValue(function(event) {
            event.tasks.forEach(function(task) {

                task.isRunning = false;
                task.hasCompleted = false;

                mapping[task.path] = task;
                tasks.push(task);
            });
            
            broadcastStateUpdate();
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

}