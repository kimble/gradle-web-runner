function createBuildDetailsTab(pubsub) {
    "use strict";

    var $buildDetails = $("#buildDetails");
    var $header = $buildDetails.find(".page-header h3");
    var $projectName = $(".project-name");


    // Update project name
    pubsub.stream("SettingsReady")
        .map(".settings.projectName")
        .assign($projectName, "html");


    var toggleShyness = function() {
        $buildDetails.toggleClass("shy");
    };

    $header.on("click", toggleShyness);
    pubsub.stream("key-down-D").onValue(toggleShyness);



    function splitCamelCaseToString(s) {
        return s.split(/(?=[A-Z])/).join(' ');
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    pubsub.stream("SettingsReady")
        .map(".settings")
        .map(function(settingsMap) {
            return Object.keys(settingsMap).map(function(key) {
                return {
                    key: key,
                    value: settingsMap[key]
                };
            });
        })
        .onValue(function(settingsList) {
            var buildProperty = d3.select("#buildDetailsContainer tbody")
                .selectAll('tr')
                .data(settingsList);

            var enterProperty = buildProperty.enter()
                .append("tr")
                .attr("class", "setting-property");

            enterProperty.append("td")
                .attr("class", "key")
                .text(function(d) { return capitalizeFirstLetter(splitCamelCaseToString(d.key).toLowerCase()) + ": "; });

            enterProperty.append("td")
                .attr("class", "value")
                .text(function(d) { return d.value; });
        });

    pubsub.stream("TaskCompleted")
        .onValue(function (task) {
            if (task.failureMessage != null) {
                $buildDetails.addClass("failure");
            }
        });


}