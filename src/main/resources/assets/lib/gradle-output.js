function createGradleOutputConsole(pubsub) {
    var $gradleOutputContainer = $("#gradleOutput");
    var $lastLine = $gradleOutputContainer.find(".last-line");
    var $outputContainer = $gradleOutputContainer.find(".output-container");


    pubsub.stream("OutputWrittenFromGradle")
        .onValue(function(event) {
            $lastLine.html(event.line);

            $("<div>" + event.line + "</div>").appendTo($outputContainer);
        });




}