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








    // Plain data structure

    var initializeDataStructure = (function() {
        var packages = { };
        var tests = [ ];

        var createClass = function(pkg, className) {
            var classInstance = {
                pkg: pkg,
                className: className,
                simpleName: getSimpleClassName(className),
                tests: {},
                testCount: 0,
                testFailures: 0
            };

            classInstance.registerTest = function(testCompletedEvent) {
                var testInstance = {
                    className: className,
                    name: testCompletedEvent.name,
                    result: testCompletedEvent.result,
                    failure: testCompletedEvent.result === "FAILURE",
                    skipped: testCompletedEvent.result === "SKIPPED",
                    success: testCompletedEvent.result === "SUCCESS",
                    output: testCompletedEvent.output != null ? testCompletedEvent.output.join("") : null,

                    durationMillis: testCompletedEvent.durationMillis,
                    exceptionMessage: testCompletedEvent.exceptionMessage,
                    exceptionStacktrace: testCompletedEvent.exceptionStacktrace,

                    summary: ''
                };

                if (testInstance.failure) {
                    testInstance.summary = "Failed: " + testInstance.exceptionMessage;
                }
                else if (testInstance.skipped) {
                    testInstance.summary = "Skipped :-("
                }
                else if (testInstance.success) {
                    testInstance.summary = "Succeeded after " +testInstance.durationMillis + " milliseconds.";
                }


                tests.push(testInstance);
                classInstance.tests[testCompletedEvent.name] = testInstance;
                classInstance.testCount++;

                if (testInstance.failure) {
                    pkg.testFailures++;
                    classInstance.testFailures++;
                }

                pkg.testCount++;
            };


            return classInstance;
        };


        var ensurePackage = function(packageName) {
            if (!packages.hasOwnProperty(packageName)) {
                packages[packageName] = {
                    name: packageName,
                    classes: { },

                    classCount: 0,
                    testCount: 0,
                    testFailures: 0
                };

                packages[packageName].ensureClass = function(className) {
                    if (!packages[packageName].classes.hasOwnProperty(className)) {
                        packages[packageName].classes[className] = createClass(packages[packageName], className);
                        packages[packageName].classCount++;
                    }

                    return packages[packageName].classes[className];
                };

                packages[packageName].classList = function() {
                    return objectValues(packages[packageName].classes);
                }

            }

            return packages[packageName];
        };

        return {
            ensurePackage: ensurePackage,
            tests: tests,

            packageList: function() {
                return objectValues(packages);
            }
        }
    });






    var updateTriggerStream = new Bacon.Bus();


    function triggerUpdate() {
        updateTriggerStream.push("Update requested");
    }

    var initialState = {
        packages: {},
        classes: {},
        tests: {},

        selectedPackage: '',
        selectedClass: '',
        selectedTest: ''
    };


    var dataStructure = initializeDataStructure();

    var state = pubsub.stream("TestCompleted")
        .takeUntil(pubsub.stream("GradleBuildCompleted"))
        .fold(initialState, function(state, completedTest) {
            var fullClassname = completedTest.className;
            var packageName = getPackageName(fullClassname);
            var pkg = dataStructure.ensurePackage(packageName);
            var cls = pkg.ensureClass(fullClassname);
            cls.registerTest(completedTest);

            return dataStructure;
        });

    var stateUpdateStream = state.combine(updateTriggerStream, function(state) {
        return state;
    });



    state.log("State");



    // Rendering


    _.templateSettings.variable = "root";



    var testInstanceTemplate = _.template (
        $("#testInstanceTemplate").html()
    );
    var outputTemplate = _.template (
        $("#outputTemplate").html()
    );

    var $testContainer = $(".test-container");
    var $outputPanel = $("#outputPanel");
    var $outputContainer = $(".output-container");
    var $outputHeader = $(".output-header");


    var testVisibilityPredicate = function(testInstance) {
        return true; // testInstance.failure === true;
    };



    state.onValue(function(dataStructure) {
        var tests = dataStructure.tests;
        console.log("Tests: ", tests);

        tests.forEach(function(testInstance) {
            if (testVisibilityPredicate(testInstance)) {
                var alterOutputContainer = function() {
                    var $headerElement = $(testInstanceTemplate(testInstance));
                    $outputHeader.toggleClass("failure", testInstance.failure);
                    $outputHeader.toggleClass("skipped", testInstance.skipped);
                    $outputHeader.toggleClass("success", testInstance.success);
                    $outputHeader.html($headerElement);
                    $outputHeader.find("hr").remove();

                    var $newOutputElement = $(outputTemplate(testInstance));
                    $outputPanel.find(".output-container").remove();
                    $outputPanel.append($newOutputElement);
                    $outputPanel.addClass("expanded");
                };


                var $el = $(testInstanceTemplate(testInstance));
                $el.toggleClass("failure", testInstance.failure);
                $el.toggleClass("skipped", testInstance.skipped);
                $el.toggleClass("success", testInstance.success);
                $el.appendTo($testContainer);


                $el.on("click", function() {
                    if ($outputPanel.hasClass("expanded")) {
                        $outputPanel.removeClass("expanded");

                        setTimeout(function() {
                            alterOutputContainer();
                        }, 200);
                    }
                    else {
                        alterOutputContainer();
                    }
                });
            }
        });
    });



}


