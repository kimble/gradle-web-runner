function createBuildDetailsTab(pubsub) {
    "use strict";

    var $buildDetails = $("#buildDetails");
    var $header = $buildDetails.find(".page-header h3");
    var $detailsContainer = $buildDetails.find(".details-container");
    var $projectName = $buildDetails.find(".project-name");



    var toggleShyness = function() {
        $buildDetails.toggleClass("shy");
    };

    $header.on("click", toggleShyness);
    pubsub.stream("key-down-D").onValue(toggleShyness);


    pubsub.stream("SettingsReady")
        .onValue(function(event) {
            $projectName.html(event.settings.projectName);

            for (var key in event.settings) {
                if (event.settings.hasOwnProperty(key)) {
                    var value = event.settings[key];
                    $detailsContainer.append("<dt>"+ key +"</dt><dd>"+ value + "</dd>");
                }
            }
        });



}