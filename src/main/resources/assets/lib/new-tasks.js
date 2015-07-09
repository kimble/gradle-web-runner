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

    var runningItemHeight = 30;


    var queue =  svg.append("g")
        .attr("class", "queue")
        .attr("transform", "translate("+ queueStart +", 0)");


    console.log("We can display " + queueCapacity + " queued tasks");


    var x = d3.scale.linear()
        .range([ queueEnd - queueStart, 0 ])
        .domain([ 0, queueCapacity ]);





    pubsub.stream("task-state-update")
        .throttle(1500)
        .onValue(function(tasks) {
            var queueSelection = queue.selectAll(".task")
                .data(tasks, namedAttr("path"));


            queueSelection.exit().remove();


            var taskGroup = queueSelection.enter()
                .append("g")
                .attr("class", "task")
                .attr("transform", "translate(0, -200)")
                .attr("text-anchor", "start");



            taskGroup.append("text")
                .text(namedAttr("path"));


            // enter + update

            var blockedIndex = 0;
            var readyIndex = 0;
            var runningIndex = 0;

            var delayIndex = 0;

            queueSelection
                .transition()
                .duration(1500)
                //.delay(function(d, i) { return (++delayIndex) * 10; })
                .attr("transform", function(t, i) {
                if (t.isReady) {
                    return "translate(300, " + ((++readyIndex) * runningItemHeight) + ") rotate(0)";
                }
                else if (t.isRunning) {
                    return "translate(600, " + ((++runningIndex) * runningItemHeight) + ") rotate(0)";
                }
                else if (t.isBlocked) {
                    return "translate(0, " + ((++blockedIndex) * runningItemHeight) + ") rotate(0)";
                }
                else if (t.hasCompleted) {
                    return "translate(" + (width) + ", 300) rotate(0)";
                }
                else {
                    return "translate(0, -200)";
                }
            });

            // taskGroup...


        });


}