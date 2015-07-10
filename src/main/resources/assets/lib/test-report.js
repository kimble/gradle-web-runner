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


    pubsub.stream("test-list-updated")
        .throttle(1000)
        .onValue(function() {
        var d3classes = d3.select("#unorderedTestList")
            .selectAll(".test-class")
            .data(classes, namedAttr("className"));


        var enterClass = d3classes.enter()
            .append("li")
                .attr("class", "test-class")
                ;

        enterClass.append("span")
            .text(function(cls) {
                return cls.className.length > 45 ? ".." + cls.className.substring(cls.className.length - 45) : cls.className;
            });

        var enterUl = enterClass.append("ul");



        // enter + update

        // Tests

        d3classes.classed("success", function(t) { return !t.failed; })
            .classed("fail", function(t) { return t.failed; });

        d3classes.selectAll(".test")
            .classed("success", function(t) { return !t.failed; })
            .classed("fail", function(t) { return t.failed; })
            .data(namedAttr("tests"), namedAttr("name"))
            .enter()
                .append("li")
                    .attr("class", "test")
                    .text(namedAttr("name"));
    });



    pubsub.stream("TestStarted")
        .onValue(function(event) {
            if (!classMapping.hasOwnProperty(event.className)) {
                classMapping[event.className] = {
                    className: event.className,
                    failed: false,
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

            pubsub.broadcast({ type: "test-list-updated", event: classes });
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

            if (test.result === "FAILURE" && !cls.failed) {
                cls.failed = true;
            }

            pubsub.broadcast({ type: "test-list-updated", event: classes });
        });


    pubsub.stream("TestCompleted")
        .onValue(function(event) {
            if (event.result === "SUCCESS") {
                successCounter++;
            }
            if (event.result === "FAILURE") {
                failureCounter++;
            }
            if (event.result === "SKIPPED") {
                skippedCounter++;
            }

            $small.html(successCounter + " successful, " + failureCounter + " failed and " + skippedCounter + " skipped tests executed");
        });

}