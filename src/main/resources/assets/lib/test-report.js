function createTestReport(pubsub) {
    "use strict";

    var $gradleOutputContainer = $("#testReport");
    var $small = $gradleOutputContainer.find(".page-header small");
    var $outputContainer = $gradleOutputContainer.find(".test-container");
    var $header = $gradleOutputContainer.find(".page-header h3");


    var toggleShyness = function() {
        $gradleOutputContainer.toggleClass("shy");
    };

    $header.on("click", toggleShyness);
    pubsub.stream("key-down-T").onValue(toggleShyness);


    var classes = [];
    var classMapping = { };
    var successCounter = 0;
    var failureCounter = 0;
    var skippedCounter = 0;


    function updateTestList() {


        var d3classes = d3.select("#unorderedTestList")
            .selectAll(".test-class")
            .data(classes, namedAttr("className"));


        var enterClass = d3classes.enter()
            .append("li")
            .attr("class", "test-class")
            ;

        enterClass.append("span")
            .text(function(cls) {
                return cls.className.length > 30 ? ".." + cls.className.substring(cls.className.length - 30) : cls.className;
            });

    }



    pubsub.stream("TestStarted")
        .onValue(function(event) {
            if (!classMapping.hasOwnProperty(event.className)) {
                console.log("Adding clsas for " + event.className + ": ", classMapping);
                classMapping[event.className] = {
                    className: event.className,
                    testMapping: { },
                    tests: []
                };

                classes.push(classMapping[event.className]);
            }

            // Add the test to the class
            var test = {
                name: event.name,
                isRunning: true
            };

            var cls = classMapping[event.className];
            cls.testMapping[event.name] = test;
            cls.tests.push(test);

            updateTestList();
        });

    pubsub.stream("TestCompleted")
        .onValue(function(event) {
            var cls = classMapping[event.className];
            var test = cls.testMapping[event.name];

            test.isRunning = false;
            test.result = event.result;
            test.output = event.output;
            test.durationMillis = event.durationMillis;
            test.exceptionMessage = event.exceptionMessage;

            if (test.result === "SUCCESS") {
                successCounter++;
            }
            if (test.result === "FAILURE") {
                failureCounter++;
            }

            if (test.result === "SKIPPED") {
                skippedCounter++;
            }

            $small.html(successCounter + " successful, " + failureCounter + " failed and " + skippedCounter + " skipped tests executed");

            updateTestList();
        });

}