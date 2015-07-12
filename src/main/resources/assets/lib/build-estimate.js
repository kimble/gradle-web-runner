function createBuildEstimate(pubsub) {
    function hasProperty(name) {
        return function(obj) {
            return obj.hasOwnProperty(name);
        }
    }


    var $buildProgress = $("#buildProgress");
    var $progressBar = $buildProgress.find(".bar");
    var $progressLabel = $buildProgress.find(".bar-label");

    pubsub.stream('estimated-received')
        .filter(hasProperty("build"))
        .map(".build")
        .onValue(function (buildEstimate) {
            $progressLabel.html("Estimate: " + Math.ceil(buildEstimate / 1000) + " seconds");
            $progressBar.addClass("running").css("transition-duration", buildEstimate + "ms");
        });

    pubsub.stream("GradleBuildCompleted")
        .onValue(function() {
            $buildProgress.css("transition-duration", "700ms").addClass("completed");
            $buildProgress.removeClass("running");
        });

}