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
                    exceptionMessage: testCompletedEvent.exceptionMessage
                };

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

    var packageTemplate = _.template(
        $("#packageTemplate").html()
    );

    var $packages = $("#packages");


    state.onValue(function(dataStructure) {
        var packages = dataStructure.packageList();
        console.log("Packages, ", packages);


        packages.forEach(function(packageInstance) {
            var $el = $(packageTemplate(packageInstance));
            $el.toggleClass("failure", packageInstance.testFailures > 0);
            $el.appendTo($packages);
        });
    });

}


