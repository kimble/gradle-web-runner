function createTasks(pubsub) {
    "use strict";

    var width = $(document).width();
    var height = 300;

    var scene = d3.select("#taskScene")
            .attr("width", width)
            .attr("height", height);


    pubsub.stream("task-state-update")
        .onValue(function(tasks) {
            console.log("Updated tasks: ", tasks);
        });


}