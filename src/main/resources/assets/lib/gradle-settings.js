function createGradleSettings(pubsub) {
    "use strict";

    var $projectName = $("#projectName");

    pubsub.stream("SettingsReady")
        .onValue(function(event) {
            $projectName.html(event.settings.projectName);
        });

}