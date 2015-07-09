function initializeTaskState(pubsub) {
    var tasks = [];

    function broadcastStateUpdate() {
        pubsub.broadcast({ type: 'task-state-update', event: tasks });
    }

    function findTask(path) {
        for (var index in tasks) {
            if (tasks.hasOwnProperty(index)) {
                var task = tasks[index];
                if (task.path === path) {
                    return task;
                }
            }
        }

        throw "Unable to find task " + path
    }

    pubsub.stream("TaskGraphReady")
        .onValue(function(event) {
            event.tasks.forEach(function(task) {

                task.isRunning = false;
                task.hasCompleted = false;

                tasks.push(task);
            });
            
            broadcastStateUpdate();
        });

    pubsub.stream("TaskStarting")
        .onValue(function(event) {
            var task = findTask(event.path);
            task.startedAt = event.timestamp;
            task.isRunning = true;


            broadcastStateUpdate();
        });


    pubsub.stream("TaskCompleted")
        .onValue(function(event) {
            var task = findTask(event.path);

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