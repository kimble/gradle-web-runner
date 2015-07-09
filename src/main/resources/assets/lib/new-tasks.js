function createTasks(pubsub) {
    "use strict";

    function namedAttr(name) {
        return function(obj) {
            return obj[name];
        };
    }



    var width = $("#tasksScene").width();
    var height = 400;

    console.log("Width = " + width);

    var svg = d3.select("#tasksScene")
        .append("svg")
        .attr("width", width)
        .attr("height", height);




    var queueStart = 300;
    var queueEnd = queueStart + ((width - queueStart) / 2);
    var queueWidth = queueEnd - queueStart;
    var queueItemWidth = 20;
    var queueCapacity = Math.floor((queueEnd - queueStart) / queueItemWidth);


    var queue =  svg.append("g")
        .attr("class", "queue")
        .attr("transform", "translate("+ queueStart +", 0)");


    console.log("We can display " + queueCapacity + " queued tasks");


    var x = d3.scale.linear()
        .range([ queueEnd - queueStart, 0 ])
        .domain([ 0, queueCapacity ]);





    pubsub.stream("task-state-update")
        .throttle(100)
        .onValue(function(tasks) {
            var ready = tasks.filter(function(t) { return !t.hasCompleted && !t.isRunning && !t.isBlocked; });
            var display = ready.length < queueCapacity ? ready : ready.slice(0, queueCapacity);


            var queueSelection = queue.selectAll(".task")
                .data(display, namedAttr("path"));


            queueSelection.exit().remove();


            var taskGroup = queueSelection.enter()
                .append("g")
                .attr("class", "task")
                .attr("text-anchor", "start");



            taskGroup.append("text")
                .text(namedAttr("path"));


            // enter + update

            queueSelection.attr("transform", function(t, i) {
                return "translate("+ (queueWidth - (i * queueItemWidth)) +", 10) rotate(40)";
            });

            // taskGroup...


        });


}