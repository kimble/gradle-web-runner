function createRunningTestReport(pubsub) {
    "use strict";

    var $miniTestReport = $("#miniTestReport");
    var $panelContainer = $miniTestReport.find(".panel-container");
    var $summaryLine = $miniTestReport.find(".summary");


    var toggleShyness = function() {
        $miniTestReport.toggleClass("shy");
    };

    pubsub.stream("key-down-T").onValue(toggleShyness);




    var streamResultCount = (function() {
        var resultStream = pubsub.stream("TestCompleted").map(".result");

        var is = function (expected) {
            return function(val) {
                return val === expected;
            }
        };

        var plus = function (a, b) {
            return a + b;
        };

        return function(result) {
            return resultStream.filter(is(result))
                .map(1)
                .scan(0, plus);
        }
    })();


    var streamResult = (function() {
        var is = function (expected) {
            return function(test) {
                return test.result === expected;
            }
        };

        return function(result) {
            return pubsub.stream("TestCompleted").filter(is(result));
        }
    })();



    var summaryTemplate = Bacon.combineTemplate({
        successes: streamResultCount("SUCCESS"),
        failures: streamResultCount("FAILURE"),
        skipped: streamResultCount("SKIPPED")
    });


    summaryTemplate.throttle(100).onValue(function (summary) {
        $summaryLine.html(summary.successes + " successful, " + summary.failures + " failures and " + summary.skipped + " skipped tests executed");
    });

    streamResultCount("FAILURE")
        .skip(1) // 0
        .take(1)
        .onValue(function () {
            $miniTestReport.addClass("failure");
            $miniTestReport.find(".waiting-message").remove();
        });




    streamResult("FAILURE").onValue(function (test) {
        var packageName = test.className.substring(0, test.className.lastIndexOf('.'));
        var simpleClassName = test.className.substring(test.className.lastIndexOf('.') + 1);

        var $failure = $('<div class="test failed"><h2><small class="package-name">' + packageName + '</small>' +
            '<br/><span class="simple-class-name">' + simpleClassName + '</span>' +
            '<br/><span class="test-name"><span class="glyphicon glyphicon-remove-sign"></span> ' + test.name + '</span></h2>' +
            '<div class="alert alert-danger exception-message" role="alert">' + test.exceptionMessage + '</div>' +
            '<pre class="stacktrace">'+ test.exceptionStacktrace +'</pre>' +
            '<pre class="output">'+ test.output +'</pre>' +
            '</div>');

        if (test.output == null) {
            $failure.find(".output").addClass("hidden");
        }
        if (test.exceptionStacktrace == null) {
            $failure.find(".stacktrace").addClass("hidden");
        }


        $failure.appendTo($panelContainer);

        $panelContainer.append("<hr />");
    });

}