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
    var testOutputHeaderTemplate = _.template (
        $("#testOutputHeaderTemplate").html()
    );

    var $testPanel = $("#testPanel");
    var $testContainer = $(".test-container");
    var $outputPanel = $("#outputPanel");
    var $outputContainer = $(".output-container");
    var $outputHeader = $(".output-header");


    var testVisibilityPredicate = function(testInstance) {
        return true; // testInstance.failure === true;
    };


    var testSelector = (function() {
        var $previousTest = null;

        return function($selectedTest) {
            if (!$selectedTest.is($previousTest)) {
                $selectedTest.addClass("selected");
                $($previousTest).removeClass("selected");
                $previousTest = $selectedTest;
            }
        }
    })();




    state.onValue(function(dataStructure) {
        var summary = {
            success: 0,
            skipped: 0,
            failure: 0
        };

        var tests = dataStructure.tests;

        tests.forEach(function(testInstance) {
            if (testInstance.success) {
                summary.success++;
            }
            if (testInstance.failure) {
                summary.failure++;
            }
            if (testInstance.skipped) {
                summary.skipped++;
            }


            var alterOutputContainer = function() {
                var $headerElement = $(testOutputHeaderTemplate(testInstance));
                $outputHeader.toggleClass("failure", testInstance.failure);
                $outputHeader.toggleClass("skipped", testInstance.skipped);
                $outputHeader.toggleClass("success", testInstance.success);
                $outputHeader.html($headerElement);

                var $newOutputElement = $(outputTemplate(testInstance));
                $outputPanel.find(".output-container").html($newOutputElement);
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
                        testSelector($el);
                    }, 200);
                }
                else {
                    alterOutputContainer();
                    testSelector($el);
                }
            });
        });


        // Summary
        $testPanel.find("h2").html(function() {
            var text = "";
            switch (summary.success) {
                case 0:
                    text += "No successes";
                    break;

                case 1:
                    text += "A single success";
                    break;

                default:
                    text += summary.success + " successes";
            }

            switch (summary.skipped) {
                case 0:
                    break;

                case 1:
                    text += ", one skipped";
                    break;

                default:
                    text += ", " + summary.skipped + " skipped";
            }


            switch (summary.failure) {
                case 0:
                    text += " and not a single failure!";
                    break;

                case 1:
                    text += " and a single failed test..";
                    break;

                default:
                    text += " and "  + summary.failure + " failed tests";
            }

            return text;
        });

        // Show successful tests only if we don't have a single
        // skipped or failed test...
        if (summary.failure === 0 && summary.skipped === 0) {
            $testContainer.removeClass("hide-success");
        }
    });


    // Build name

    pubsub.stream("SettingsReady")
        .map(".settings.projectName")
        .onValue(function(projectName) {
            $(".project-name").html(projectName);
        });


    // Filter

    function createCheckboxStream(selector) {
        var $el = $(selector);
        return $el.asEventStream("change").map(".target.checked").toProperty($el.is(":checked"));
    }


    createCheckboxStream("#showSuccess").not().assign($testContainer, "toggleClass", "hide-success");



}


