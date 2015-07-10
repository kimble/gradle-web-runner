function createTestReport(pubsub) {
    "use strict";

    var $container = $("#testReport");
    var $small = $container.find(".page-header small");
    var $outputContainer = $container.find(".test-container");
    var $header = $container.find(".page-header h3");
    var $showSuccessful = $container.find("#showSuccessfulTests");


    var toggleShyness = function () {
        $container.toggleClass("shy");
    };

    $header.on("click", toggleShyness);
    pubsub.stream("key-down-T").onValue(toggleShyness);


    $showSuccessful.asEventStream("change")
        .map(".target.checked")
        .onValue(function(show) {
            $container.find(".individual-tests").toggleClass("show-successful", show); // Todo: Replace with d3
        });


    // D3 state
    var packages = [];

    // Helper
    var packageMapping = {};

    var successCounter = 0;
    var failureCounter = 0;
    var skippedCounter = 0;


    pubsub.stream("test-list-updated")
        .throttle(1000)
        .onValue(function(packages) {

            var packagesSelection = d3.select("#fullTestReport")
                .selectAll(".test-package")
                .data(packages, namedAttr("packageName"));


            var testPackage = packagesSelection.enter()
                .append("div")
                .attr("class", "test-package");

            testPackage.append("h2")
                .attr("class", "package-name")
                .text(namedAttr("packageName"));

            testPackage.append("hr");

            var classes = testPackage.append("div")
                .attr("class", "classes");


            packagesSelection.classed("success", function(d) { return !d.failed; })
                .classed("fail", function(d) { return d.failed; });

            // classes


            var testClasses = packagesSelection.select(".classes")
                .selectAll(".test-class")
                .data(namedAttr("classes"), namedAttr("className"));




            var testClass = testClasses.enter()
                    .append("div")
                    .attr("class", "test-class");

            testClass.append("h3")
                .attr("class", "class-name")
                .text(function(d) {
                    return d.simpleClassName;
                });

            testClass.append("div")
                .attr("class", "individual-tests");


            // Update status of test class

            testClasses.classed("success", function(d) { return !d.failed; })
                .classed("fail", function(d) { return d.failed; });

            testClasses.selectAll(".individual-tests")
                .classed("success", function (t) { return !t.failed; })
                .classed("fail", function (t) { return t.failed; });


            // tests (methods)

            var tests = testClasses.select(".individual-tests")
                .selectAll(".individual-test")
                .data(namedAttr("tests"), namedAttr("name"));


            var test = tests.enter()
                .append("div")
                .attr("class", "individual-test")
                .on("click", function(d) {
                    console.log(d.output);
                });


            var header = test.append("h4")
                .attr("class", "test-name")
                .text(function(d) {
                    return d.name + " ";
                });

            header.append("span")
                .attr("class", "glyphicon glyphicon-paperclip")
                .attr("title", "Contains test output")
                .classed("hidden", function(d) { return d.output == null; });


            // Update test status class
            tests.classed("success", function(d) { return d.result === "SUCCESS"; })
                .classed("skipped", function(d) { return d.result === "SKIPPED"; })
                .classed("fail", function(d) { return d.result === "FAILURE"; });



        });


    pubsub.stream("TestStarted")
        .onValue(function (event) {
            var simpleClassName = event.className.substring(event.className.lastIndexOf('.') + 1);
            var packageName = event.className.substring(0, event.className.lastIndexOf('.'));

            if (!packageMapping.hasOwnProperty(packageName)) {
                packageMapping[packageName] = {
                    packageName: packageName,
                    failed: false,
                    classes: [],
                    classMapping: {}
                };

                packages.push(packageMapping[packageName]);
            }

            var classPackage = packageMapping[packageName];

            if (!classPackage.classMapping.hasOwnProperty(event.className)) {
                classPackage.classMapping[event.className] = {
                    packageName: packageName,
                    simpleClassName: simpleClassName,
                    className: event.className,
                    failed: false,
                    testMapping: {},
                    tests: []
                };

                classPackage.classes.push(classPackage.classMapping[event.className]);
            }

            // Add the test to the class
            var test = {
                name: event.name,
                isRunning: true
            };

            var cls = classPackage.classMapping[event.className];
            cls.testMapping[event.name] = test;
            cls.tests.push(test);

            pubsub.broadcast({type: "test-list-updated", event: packages});
        });

    pubsub.stream("TestCompleted")
        .onValue(function (event) {
            var packageName = event.className.substring(0, event.className.lastIndexOf('.'));

            var testPackage = packageMapping[packageName];
            var cls = testPackage.classMapping[event.className];
            var test = cls.testMapping[event.name];

            test.isRunning = false;
            test.result = event.result;
            test.output = event.output != null ? event.output.join("") : null;
            test.durationMillis = event.durationMillis;
            test.exceptionMessage = event.exceptionMessage;

            if (test.result === "FAILURE") {
                testPackage.failed = true;
                cls.failed = true;
                test.failed = true;
            }

            pubsub.broadcast({type: "test-list-updated", event: packages});
        });


    pubsub.stream("TestCompleted")
        .onValue(function (event) {
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