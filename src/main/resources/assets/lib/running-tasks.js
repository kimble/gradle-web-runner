function createRunningTasks(pubsub) {
    "use strict";

    function namedAttr(name) {
        return function(obj) {
            return obj[name];
        };
    }



    var width = $("#tasksScene").width();
    var height = 400;



    var svg = d3.select("#tasksScene")
        .append("svg")
        .attr("width", width)
        .attr("height", height);






    var tasksContainer =  svg.append("g")
        .attr("class", "running-tasks")
        .attr("transform", "translate(0, 20)");




    var taskHeight = 50;


    var runningTasks = [];


    pubsub.stream("task-state-update")
        .throttle(1000)
        .onValue(function(tasks) {
            runningTasks = tasks.filter(function(t) { return t.isRunning; });


            var runningTask = tasksContainer.selectAll(".running-task")
                .data(runningTasks, namedAttr("path"));


            // enter
            var runningTaskEnter = runningTask.enter()
                .append("g")
                .attr("transform", function(t, i) {
                    return "translate(0, " + (i * taskHeight) + ")";
                })
                .attr("class", "running-task");

            runningTaskEnter.append("text")
                .attr("class", "task-path")
                .text(namedAttr("path"))
                .each(function(d) {
                    d._svg_width = this.getBBox().width; // Used to create "progress bar" for estimates
                });

            runningTaskEnter.append("rect")
                .attr("visible", function(t) { return t.estimateMillis !== null ? "visible" : "hidden"; })
                .attr("class", "task-estimate")
                .attr("x", 2)
                .attr("y", 5)
                .attr("height", 20)
                .attr("width", namedAttr("_svg_width"))
                .transition()
                    .attr("transform", function(t, i) {
                        return "translate(0, " + (i * taskHeight) + ")";
                    });

            runningTaskEnter.append("text")
                .attr("class", "task-description")
                .attr("transform", "translate(5, 20)")
                .text(function(t) {
                    return t.description != null ? t.description : "No description";
                });

            // enter + update

            runningTask.select(".task-estimate")
                .transition()
                .duration(function(t) {
                    return t.estimateMillis;
                })
                .attr("width", 0);

            runningTask.attr("transform", function(t, i) {
                    return "translate(0, " + (i * taskHeight) + ")";
                });

            // exit
            runningTask.exit().remove();

        });





}