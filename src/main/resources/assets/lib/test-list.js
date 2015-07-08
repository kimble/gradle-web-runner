function createTestList() {
    var failedTestsSelection = d3.select("#failedTests");
    var runningTestsSelection = d3.select("#runningTests");
    var successfulTestsSelection = d3.select("#successfulTests");

    return function(data) {
        var running = data.tests.filter(function(t) { return t.result == null; });
        var failed = data.tests.filter(function(t) { return t.result == "FAILURE" || t.result == "SKIPPED"; });
        var success = data.tests.filter(function(t) { return t.result == "SUCCESS"; });


        // Running
        (function() {
            var test = runningTestsSelection.selectAll(".test")
                .data(running, function(d) { return d.className + ":" + d.name; });

            // Enter
            test.enter()
                .append("div")
                    .attr("class", "test")
                    .append("h3")
                        .append("span")
                            .text(function(d) { return d.className + " / " + d.name; });

            test.exit().remove();
        })();

        // Failed
        (function() {
            var test = failedTestsSelection.selectAll(".test")
                .data(failed, function(d) { return d.className + ":" + d.name; });

            // Enter
            test.enter()
                .append("div")
                    .attr("class", "test")
                    .append("h3")
                        .append("span")
                            .text(function(d) { return d.className + " / " + d.name; });
        })();

        // Success
        (function() {
            var test = successfulTestsSelection.selectAll(".test")
                .data(success, function(d) { return d.className + ":" + d.name; });

            // Enter
            test.enter()
                .append("div")
                    .attr("class", "test")
                    .append("h3")
                        .append("span")
                            .text(function(d) { return d.className + " / " + d.name; });
        })();





    }
}