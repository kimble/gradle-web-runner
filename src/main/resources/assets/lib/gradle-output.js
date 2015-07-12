function createGradleOutputConsole(pubsub) {
    "use strict";

    var $gradleOutputContainer = $("#gradleOutput");
    var $outputContainer = $gradleOutputContainer.find(".output-container");
    var $header = $gradleOutputContainer.find(".page-header h3");


    var toggleShyness = function() {
        $gradleOutputContainer.toggleClass("shy");
    };

    $header.on("click", toggleShyness);
    pubsub.stream("key-down-O").onValue(toggleShyness);


    pubsub.stream("OutputWrittenFromGradle")
        .onValue(function(event) {
            $outputContainer.append("<div>" + event.line + "</div>");
            $outputContainer.prop("scrollTop", $outputContainer.prop("scrollHeight") - $outputContainer.height());
        });

}