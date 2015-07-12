function createCounters(pubsub) {
    "use strict";

    var $taskCounterContainer = $("#taskCounterContainer");

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

    var buildCompleted = pubsub.stream("GradleBuildCompleted")
        .map(true)
        .toProperty(false);

    pubsub.stream("TaskGraphReady")
        .onValue(function(event) {
            taskCount = event.tasks.length;
            taskCountdown.setValue(taskCount);
        });

    pubsub.stream("TaskCompleted")
        .bufferWithTime(1500)
        .takeWhile(buildCompleted.not())
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

    pubsub.stream("GradleBuildCompleted")
        .onValue(function() {
            $taskCounterContainer.find("h3").html("Executed tasks");
            taskCountdown.setValue(taskCount);
        });

}