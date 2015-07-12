function createCounters(pubsub) {
    "use strict";

    var testCounter = $('#testCounter').FlipClock(0, {
        clockFace: 'Counter',
        minimumDigits: 4,
        animationRate: 100
    });

    var taskCountdown = $('#taskCountdown').FlipClock(0, {
        clockFace: 'Counter',
        minimumDigits: 4,
        animationRate: 100
    });

    var durationClock = $('#durationClock').FlipClock(0, {
        clockFace: 'MinuteCounter',
        animationRate: 100
    });


    var tasksCompleted = 0;
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

    pubsub.stream("GradleBuildCompleted")
        .onValue(function(event) {
            durationClock.stop();
            durationClock.setTime(Math.ceil(event.durationMillis / 1000));
        });

    var testCount = 0;
    pubsub.stream("TestCompleted")
        .bufferWithTime(1500)
        .onValue(function(event) {
            testCount += event.length;
            testCounter.setValue(testCount);
        });
}