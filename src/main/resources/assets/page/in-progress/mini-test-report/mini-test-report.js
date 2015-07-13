function createRunningTestReport(pubsub) {
    "use strict";


    var $miniTestReport = $("#miniTestReport");
    var $summaryLine = $miniTestReport.find(".summary");
    var $header = $miniTestReport.find(".page-header h3");


    var toggleShyness = function() {
        $miniTestReport.toggleClass("shy");
    };

    $header.on("click", toggleShyness);
    pubsub.stream("key-down-T").onValue(toggleShyness);




    var createResultStream = (function() {
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



    var summaryTemplate = Bacon.combineTemplate({
        successes: createResultStream("SUCCESS"),
        failures: createResultStream("FAILURE"),
        skipped: createResultStream("SKIPPED")
    });


    summaryTemplate.throttle(100).onValue(function (summary) {
        $summaryLine.html(summary.successes + " successful, " + summary.failures + " failures and " + summary.skipped + " skipped tests executed");
    });


    createResultStream("FAILURE")
        .skip(1) // 0
        .take(1)
        .assign($miniTestReport, "toggleClass", "failure");

}