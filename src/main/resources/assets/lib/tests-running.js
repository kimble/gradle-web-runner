function createRunningTestReport(pubsub) {
    "use strict";


    var $runningTestsContainer = $("#runningTestsContainer");
    var testElMapping = { };

    pubsub.stream("TestStarted")
        .onValue(function (test) {
            var key = test.className + ":" + test.name;
            var $el = $('<div class="test running"><h3>' + test.className + " / " + test.name + '</h3></div>');
            $el.appendTo($runningTestsContainer);

            testElMapping[key] = $el;
        });

    pubsub.stream("TestCompleted")
        .onValue(function (test) {
            var key = test.className + ":" + test.name;
            testElMapping[key].addClass(test.result.toLowerCase());

            if (test.result === "SUCCESS") {
                testElMapping[key].remove();
            }
        });


}