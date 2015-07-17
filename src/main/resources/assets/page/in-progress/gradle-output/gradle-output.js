function createGradleOutputConsole(pubsub, buildNumber) {
    "use strict";

    var $gradleOutputContainer = $("#gradleOutput");
    var $outputContainer = $gradleOutputContainer.find(".output-container");
    var $header = $gradleOutputContainer.find(".page-header h3");


    var toggleShyness = function() {
        $gradleOutputContainer.toggleClass("shy");
    };

    $header.on("click", toggleShyness);
    pubsub.stream("key-down-O").onValue(toggleShyness);


    var scrollToBottom = function() {
        $outputContainer.prop("scrollTop", $outputContainer.prop("scrollHeight") - $outputContainer.height());
    };


    pubsub.stream("OutputWrittenFromGradle")
        .map(".line")
        .bufferWithTime(200)
        .onValue(function(lines) {
            var htmlLines = lines.map(function(line) {
                var linkedLine = line.replace(/((file|http|https|ftp|ftps):\/\/[^\s]+)/, '<a href="$1" target="_blank">$1</a>');
                return "<div>" + linkedLine + "</div>";
            });

            var html = htmlLines.join("");
            $outputContainer.append(html);

            scrollToBottom();
        });

    pubsub.stream("GradleBuildCompleted")
        .delay(300)
        .onValue(function() {
            $outputContainer.append("<div style='margin-top: 1em; margin-bottom: 5em;'><a href='/api/build/"+buildNumber+"/test-report'>Complete test report</a></div>");
            scrollToBottom();
        });
}