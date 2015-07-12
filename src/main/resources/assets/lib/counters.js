function createCounters(pubsub) {
    "use strict";

    var testCounter = $('#testCounter').FlipClock(0, {
        clockFace: 'Counter',
        minimumDigits: 4
    });

    var taskCountdown = $('#taskCountdown').FlipClock(0, {
        clockFace: 'Counter',
        minimumDigits: 4
    });


    var tasksCompleted = 0;
    var testCount = 0;
    var taskCount = 0;

    pubsub.stream("TaskGraphReady")
        .onValue(function(event) {
            taskCount = event.tasks.length;
            taskCountdown.setValue(taskCount);
        });

    pubsub.stream("TaskCompleted")
        .bufferWithTime(1500)
        .onValue(function(event) {
            tasksCompleted += event.length;
            taskCountdown.setValue(taskCount - tasksCompleted);
        });

    pubsub.stream("TestCompleted")
        .bufferWithTime(1500)
        .onValue(function(event) {
            testCount += event.length;
            testCounter.setValue(testCount);
        });

}