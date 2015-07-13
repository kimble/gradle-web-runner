function createBuildEstimate(pubsub) {
    function hasProperty(name) {
        return function(obj) {
            return obj != null && obj.hasOwnProperty(name);
        }
    }

    function plus(a, b) {
        return a + b;
    }

    var buildCompleted = pubsub.stream("GradleBuildCompleted")
        .map(true)
        .toProperty(false);

    var completedTasks = pubsub.stream("TaskCompleted")
        .map(1)
        .scan(0, plus);


    var taskGraph = pubsub.stream("TaskGraphReady").take(1);
    var taskCount = taskGraph.map(".tasks.length").toProperty();
    var taskGraphReadyAt = taskGraph.map(Date.now()).toProperty(); // Use client time

    var buildEstimate = pubsub.stream("estimates-received")
        .filter(hasProperty("build"))
        .map(".build")
        .toProperty(-1);

    var progressSummaryTemplate = Bacon.combineTemplate({
        startTime: taskGraphReadyAt,
        buildEstimate: buildEstimate,
        completedTasks: completedTasks,
        taskCount: taskCount
    });

    var $buildProgress = $("#buildProgress");
    var $progressBar = $buildProgress.find(".bar");
    var $progressLabel = $buildProgress.find(".bar-label");



    progressSummaryTemplate.sampledBy(Bacon.interval(1000, "ping"))
        .takeWhile(buildCompleted.not())
        .onValue(function(progressSummary) {
            var summary = (progressSummary.taskCount - progressSummary.completedTasks) + " tasks remaining (" + progressSummary.completedTasks + " completed)";

            if (progressSummary.buildEstimate > 0) {
                var elapsedSeconds = Math.ceil((Date.now() - progressSummary.startTime) / 1000);
                var estimatedSeconds = Math.ceil(progressSummary.buildEstimate / 1000);
                var remainingSeconds = estimatedSeconds - elapsedSeconds;

                if (remainingSeconds >= 0) {
                    summary += " Estimate: " + remainingSeconds + " " + (remainingSeconds == 1 ? "second" : "seconds") + " remaining..";
                }
                else {
                    summary += " " + (elapsedSeconds - estimatedSeconds) + " seconds over estimated build time..";
                }
            }

            $progressLabel.html(summary);
        });


    buildEstimate.skip(1).onValue(function(estimate) {
        $progressBar.addClass("running").css("transition-duration", estimate + "ms");
    });


    buildCompleted.changes()
        .take(1)
        .onValue(function() {
            $buildProgress.css("transition-duration", "700ms").addClass("completed");
            $buildProgress.removeClass("running");
        });






}