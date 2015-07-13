function createTestReport(pubsub) {
    "use strict";


    function getPackageName(className) {
        return className.substring(0, className.lastIndexOf('.'));
    }

    function getSimpleClassName(className) {
        return className.substring(className.lastIndexOf('.') + 1);
    }

    function objectValues(obj) {
        return Object.keys(obj).map(function(key) {
            return obj[key];
        });
    }

    function prop(name) {
        return function(obj) {
            return obj[name];
        }
    }


    var state = pubsub.stream("TestCompleted")
        .takeUntil(pubsub.stream("GradleBuildCompleted"))
        .fold({ packages: {}, classes: {}, tests: {} }, function(state, startedTest) {
            var packageName = getPackageName(startedTest.className);
            var simpleName = getSimpleClassName(startedTest.className);
            var testName = startedTest.name;

            // Add package
            if (!state.packages.hasOwnProperty(packageName)) {
                state.packages[packageName] = {
                    name: packageName,
                    tests: { },
                    classes: { }
                }
            }

            // Add classes
            var pkg = state.packages[packageName];
            if (!pkg.classes.hasOwnProperty(startedTest.className)) {
                var clazzState = {
                    className: startedTest.className,
                    simpleName: simpleName,
                    packageName: packageName,
                    name: simpleName,
                    tests: { }
                };

                pkg.classes[startedTest.className] = clazzState;
                state.classes[startedTest.className] = clazzState;
            }

            // Finally, add test
            var clazz = pkg.classes[startedTest.className];
            var test = {
                name: testName,
                packageName: packageName,
                className: startedTest.className,
                result: startedTest.result,
                output: startedTest.output != null ? startedTest.output.join("") : null,
                durationMillis: startedTest.durationMillis,
                exceptionMessage: startedTest.exceptionMessage
            };

            clazz.tests[testName] = test;
            pkg.tests[testName] = test;
            state.tests[startedTest.className + "-" + testName] = test;

            return state;
        });


    state.log("State");



    state.map(".packages")
        .map(objectValues)
        .onValue(function(packages) {
            console.log("Packages, ", packages);


            var pkg = d3.select("#packages")
                .selectAll(".package")
                .data(packages, prop("name"));


            var enterPackage = pkg.enter()
                .append("div")
                .attr("class", "package");

            enterPackage.append("h3")
                .text(prop("name"));

            enterPackage.append("p")
                .attr("class", "summary")
                .text("Her kommer oppsummering");
        });

    state.map(".classes")
        .map(objectValues)
        .onValue(function(classes) {
            console.log("Classes, ", classes);


            var pkg = d3.select("#classes")
                .selectAll(".test-class")
                .data(classes, prop("className"));


            var enterPackage = pkg.enter()
                .append("div")
                .attr("class", "test-class");

            enterPackage.append("h3")
                .text(prop("simpleName"));

            enterPackage.append("p")
                .attr("class", "summary")
                .text("Her kommer oppsummering");
        });

    state.map(".tests")
        .map(objectValues)
        .onValue(function(tests) {
            console.log("Tests, ", tests);


            var pkg = d3.select("#tests")
                .selectAll(".test")
                .data(tests, prop("name"));


            var enterPackage = pkg.enter()
                .append("div")
                .attr("class", "test");

            enterPackage.append("h3")
                .text(prop("name"));

            enterPackage.append("p")
                .attr("class", "summary")
                .text("Her kommer oppsummering");
        });

}




/*
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
                    var $el = $(this);
                    if (d.output !== null && $el.find("pre").length === 0) {
                        $el.append("<pre>" + d.output + "</pre>");
                    }
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
    */