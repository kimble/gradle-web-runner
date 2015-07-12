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
        .map(".line")
        .bufferWithTime(200)
        .onValue(function(lines) {
            var htmlLines = lines.map(function(line) {
                var linkedLine = line.replace(/((file|http|https|ftp|ftps):\/\/[^\s]+)/, '<a href="$1" target="_blank">$1</a>');
                return "<div>" + linkedLine + "</div>";
            });

            var html = htmlLines.join("");
            $outputContainer.append(html);

            // Scroll
            $outputContainer.prop("scrollTop", $outputContainer.prop("scrollHeight") - $outputContainer.height());
        });
}