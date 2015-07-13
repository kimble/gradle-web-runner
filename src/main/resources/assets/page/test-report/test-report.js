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

    function greaterThenZero(prop) {
        return function(obj) {
            return obj[prop] > 0;
        }
    }

    function prop(name) {
        return function(obj) {
            return obj[name];
        }
    }

    function not(func) {
        return function(val) {
            return !func(val);
        }
    }


    var initialState = {
        packages: {},
        classes: {},
        tests: {},

        selectedPackage: '',
        selectedClass: '',
        selectedTest: ''
    };

    var state = pubsub.stream("TestCompleted")
        .takeUntil(pubsub.stream("GradleBuildCompleted"))
        .fold(initialState, function(state, startedTest) {
            var packageName = getPackageName(startedTest.className);
            var simpleName = getSimpleClassName(startedTest.className);
            var testName = startedTest.name;

            // Add package
            if (!state.packages.hasOwnProperty(packageName)) {
                state.packages[packageName] = {
                    name: packageName,
                    failures: 0,
                    tests: { },
                    classes: { },
                    classCount: 0,
                    testCount: 0
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
                    failures: 0,
                    testCount: 0,
                    tests: { }
                };

                pkg.classCount++;
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
                failure: startedTest.result === "FAILURE",
                skipped: startedTest.result === "SKIPPED",
                success: startedTest.result === "SUCCESS",
                output: startedTest.output != null ? startedTest.output.join("") : null,
                durationMillis: startedTest.durationMillis,
                exceptionMessage: startedTest.exceptionMessage
            };

            // Propagate failure upwards
            if (test.failure) {
                clazz.failures++;
                pkg.failures++;
            }

            // Count
            clazz.testCount++;
            pkg.testCount++;

            clazz.tests[testName] = test;
            pkg.tests[testName] = test;
            state.tests[startedTest.className + "-" + testName] = test;

            return state;
        });


    state.log("State");



    // Rendering





    var updateTriggerStream = new Bacon.Bus();

    var stateUpdateStream = state.combine(updateTriggerStream, function(state) {
        return state;
    });






    function triggerUpdate() {
        updateTriggerStream.push("Update requested");
    }


    state.onValue(function(state) {
        var packages = objectValues(state.packages);
        console.log("Packages, ", packages);


        var pkg = d3.select("#packages")
            .selectAll(".package")
            .data(packages, prop("name"));

        var enterPackage = pkg.enter()
            .append("div")
            .on("click", function(p) {
                state.selectedPackage = p.name;
                state.selectedClass = '';
                state.selectedTest = '';
                triggerUpdate();
            })
            .attr("class", "entity package")
            .classed("failure", greaterThenZero("failures"));

        enterPackage.append("h3")
            .text(prop("name"));

        enterPackage.append("p")
            .attr("class", "summary")
            .text(function(p) {
                return p.classCount + " classes with a total of " + p.testCount + " tests";
            });


        // Updates

        stateUpdateStream.map(".packages")
            .map(objectValues)
            .onValue(function(updatedPackages) {
                var pkg = d3.select("#packages")
                    .selectAll(".package")
                    .data(updatedPackages, prop("name"));

            });
    });




    // Test classes

    state.onValue(function(state) {
        var classes = objectValues(state.classes);
        console.log("Classes, ", classes);


        var clazz = d3.select("#classes")
            .selectAll(".test-class")
            .data(classes, prop("className"));


        var enterClass = clazz.enter()
            .append("div")
            .attr("class", "entity test-class")
            .classed("hidden", function(c) {
                return c.packageName !== state.selectedPackage;
            })
            .classed("failure", greaterThenZero("failures"))
            .on("click", function(p) {
                state.selectedPackage = p.packageName;
                state.selectedClass = p.className;
                state.selectedTest = '';
                triggerUpdate();
            });

        enterClass.append("h3")
            .text(prop("simpleName"));

        enterClass.append("p")
            .attr("class", "summary")
            .text(function(c) {
                return c.testCount + " tests.";
            });


        // Updates

        stateUpdateStream.onValue(function(state) {
            var classes = objectValues(state.classes);


            var clazz = d3.select("#classes")
                .selectAll(".test-class")
                .data(classes, prop("className"));

            clazz.classed("hidden", function(c) {
                return c.packageName !== state.selectedPackage;
            });
        });

    });


    // Individual tests

    state.onValue(function(state) {
        var tests = objectValues(state.tests);
        console.log("Tests, ", tests);

        var test = d3.select("#tests")
            .selectAll(".test")
            .data(tests, prop("name"));


        var enterTest = test.enter()
            .append("div")
            .attr("class", "entity test")
            .classed("hidden", function (t) {
                return t.className !== state.selectedClass;
            })
            .classed("failure", prop("failure"));

        enterTest.append("h3")
            .text(prop("name"));

        enterTest.append("p")
            .attr("class", "summary")
            .text(function(t) {
                switch (t.result) {
                    case "SKIPPED":
                        return "Skipped :-(";

                    case "FAILURE":
                        return "Failure: " + t.exceptionMessage;

                    case "SUCCESS":
                        return "Completed successfully in " + t.durationMillis + " milliseconds.";

                    default:
                        return "????";
                }
            });


        // Updates

        stateUpdateStream.onValue(function(state) {
            var tests = objectValues(state.tests);
            var test = d3.select("#tests")
                .selectAll(".test")
                .data(tests, prop("name"));

            test.classed("hidden", function (t) {
                return t.className !== state.selectedClass;
            });
        });

    });

}


