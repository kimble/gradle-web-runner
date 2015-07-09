function createGradleOutputConsole(pubsub) {
    "use strict";

    var $gradleOutputContainer = $("#gradleOutput");
    var $lastLine = $gradleOutputContainer.find(".last-line");
    var $outputContainer = $gradleOutputContainer.find(".output-container");
    var $header = $gradleOutputContainer.find(".page-header");


    $header.on("click", function() {
        $gradleOutputContainer.toggleClass("shy");
    });


    pubsub.stream("OutputWrittenFromGradle")
        .onValue(function(event) {
            $lastLine.html(event.line);

            $outputContainer.append("<div>" + event.line + "</div>");
            $outputContainer.prop("scrollTop", $outputContainer.prop("scrollHeight") - $outputContainer.height());
        });




}