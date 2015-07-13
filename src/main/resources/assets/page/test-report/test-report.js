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


    function createInitialState() {
        var focus = (function() {
            var focusElements = { };

            var ensureElement = function(name) {
                if (!focusElements.hasOwnProperty(name)) {
                    focusElements[name] = $('<span class="glyphicon glyphicon-star entity-focus" style="position: absolute; left: -100px; top: -100px;"></span>');
                    $("body").append(focusElements[name]);
                }

                return focusElements[name];
            };

            return {
                give: function(name, $focusedElement) {
                    var $focusElement = ensureElement(name);

                    $focusElement.css("left", $focusedElement.offset().left - 30)
                                 .css("top", $focusedElement.offset().top + 15);
                },
                take: function(name) {
                    var $focusElement = ensureElement(name);
                    $focusElement.css("top", -100);
                }
            }
        })();


        var state = {
            packages: {},
            classes: {},
            tests: {},

            selectedPackage: '',
            selectedClass: '',
            selectedTest: ''
        };

        state.selectPackage = function(packageName) {
            state.selectedPackage = packageName;
            state.selectedClass = '';
            state.selectedTest = '';

            focus.give("package", state.packages[packageName].$el);
            focus.take("class");
            focus.take("test");
        };

        state.selectClass = function(className) {
            state.selectedPackage = getPackageName(className);
            state.selectedClass = className;
            state.selectedTest = '';

            focus.give("class", state.classes[className].$el);
            focus.take("test");
        };

        state.selectTest = function(className, name) {
            state.selectedPackage = getPackageName(className);
            state.selectedClass = className;
            state.selectedTest = name;

            focus.give("test", state.tests[className + "-" + name].$el);
        };

        state.ensurePackage = function(packageName) {
            if (!state.packages.hasOwnProperty(packageName)) {
                var pkg = {
                    name: packageName,
                    failures: 0,
                    tests: { },
                    classes: { },
                    classCount: 0,
                    testCount: 0
                };


                // Select
                pkg.select = function() {
                    if (pkg.hasOwnProperty("$el")) {
                        focus.give("package", pkg.$el);
                        focus.take("class");
                        focus.take("test");
                        state.selectedPackage = pkg.name;
                    }
                };

                pkg.ensureClass = function(className) {
                    if (!pkg.classes.hasOwnProperty(className)) {
                        var simpleName = getSimpleClassName(className);

                        var clazzState = {
                            className: className,
                            simpleName: simpleName,
                            packageName: packageName,
                            name: simpleName,
                            failures: 0,
                            testCount: 0,
                            tests: { }
                        };

                        // Select
                        clazzState.select = function() {
                            if (clazzState.hasOwnProperty("$el")) {
                                focus.give("class", clazzState.$el);
                                focus.take("test");
                                state.selectedClass = clazzState.className;
                            }
                        };

                        clazzState.addTest = function(testCompletedEvent) {
                            var test = {
                                packageName: packageName,
                                className: className,
                                name: testCompletedEvent.name,
                                result: testCompletedEvent.result,
                                failure: testCompletedEvent.result === "FAILURE",
                                skipped: testCompletedEvent.result === "SKIPPED",
                                success: testCompletedEvent.result === "SUCCESS",
                                output: testCompletedEvent.output != null ? testCompletedEvent.output.join("") : null,
                                durationMillis: testCompletedEvent.durationMillis,
                                exceptionMessage: testCompletedEvent.exceptionMessage
                            };

                            // Select
                            test.select = function() {
                                if (test.hasOwnProperty("$el")) {
                                    focus.give("test", test.$el);
                                    state.selectedTest = test.name;
                                }
                            };

                            // Propagate failure upwards
                            if (test.failure) {
                                clazzState.failures++;
                                pkg.failures++;
                            }

                            // Count
                            clazzState.testCount++;
                            pkg.testCount++;

                            // State
                            clazzState.tests[name] = test;
                            state.tests[className + "-" + name] = test;
                        };


                        pkg.classCount++;
                        pkg.classes[className] = clazzState; // Register class with package
                        state.classes[className] = clazzState; // Register class globally
                    }

                    // This should now exist
                    return state.classes[className];
                };

                state.packages[packageName] = pkg;
            }

            return state.packages[packageName];
        };

        return state;
    }




    var state = pubsub.stream("TestCompleted")
        .takeUntil(pubsub.stream("GradleBuildCompleted"))
        .fold(createInitialState(), function(state, completedTest) {
            var packageName = getPackageName(completedTest.className);
            var pkg = state.ensurePackage(packageName);
            var clazz = pkg.ensureClass(completedTest.className);
            clazz.addTest(completedTest);

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
                p.select();
                triggerUpdate();
            })
            .attr("class", "entity package")
            .classed("failure", greaterThenZero("failures"))
            .each(function(p) {
                p.$el = $(this);
            });

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
                d3.select("#packages")
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
            .on("click", function(c) {
                c.select();
                triggerUpdate();
            })
            .each(function(p) {
                p.$el = $(this);
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
            .classed("failure", prop("failure"))
            .on("click", function(t) {
                t.select();
                triggerUpdate();
            })
            .each(function(t) {
                t.$el = $(this);
            });

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


