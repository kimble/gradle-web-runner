function createTasks(pubsub) {
    "use strict";

    var width = $("#tasksScene").width();
    var height = 400;

    console.log("Width = " + width);

    var svg = d3.select("#tasksScene")
        .append("svg")
        .attr("width", width)
        .attr("height", height);




    var queueStart = 300;
    var queueEnd = queueStart + ((width - queueStart) / 2);
    var queueItemWidth = 30;
    var queueCapacity = Math.floor((queueEnd - queueStart) / queueItemWidth);


    var queue =  svg.append("g")
        .attr("class", "queue")
        .attr("transform", "translate("+ queueStart +", 0)");

    var queueSelection = queue.selectAll(".task");

    console.log("We can display " + queueCapacity + " queued tasks");


    var x = d3.scale.linear()
        .domain([ 0, queueEnd - queueStart ])
        .range([ 0, queueCapacity ]);





    pubsub.stream("task-state-update")
        .onValue(function(tasks) {

            console.log("Blocked: " + tasks.filter(function(t) { return t.isBlocked; }).length);



        });


}