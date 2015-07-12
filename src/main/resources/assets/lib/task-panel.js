function createTaskPanel(pubsub) {
    "use strict";

    var $taskPanel = $("#taskPanel");
    var $container = $taskPanel.find("#taskStack");



    function namedAttr(name) {
        return function(obj) {
            return obj[name];
        };
    }

    var height = $container.height();
    var width = 20;

    var colors = {
        ProcessResources: '#F7E61C',
        JavaCompile: '#9FD51F',
        Jar: '#CB59CF',
        Test: '#4180CF',
        DefaultTask: '#6F4379',
        Delete: '#B21347',
        Exec: '#6F99FB'
    };

    function colorFor(task) {
        if (colors.hasOwnProperty(task.type)) {
            return colors[task.type];
        }
        else {
            console.warn("No color configured for " + task.type);
            return "#555";
        }
    }


    var svg = d3.select("#taskStack")
        .append("svg")
        .attr("width", width)
        .attr("height", height);



    // Group containing the stacked elements
    var stackGroup = svg.append("g");



    pubsub.stream("task-state-update")
        .throttle(500)
        .onValue(function(tasks) {
            var taskCount = tasks.length;
            var taskHeight = height / taskCount;


            var y = d3.scale.linear()
                .domain([ 0, taskCount ])
                .range([ height, 0 ]);


            var stackedTask = stackGroup.selectAll(".stacked-task")
                .data(tasks, namedAttr("path"));



            var enter = stackedTask.enter()
                .append("g")
                .attr("class", "stacked-task")
                .attr("transform", "translate(0, -10)"); // Start position for transition

            enter.append("rect")
                .attr("fill", function(d) { return d3.rgb(colorFor(d)); })
                .attr("opacity", 0.2)
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", width)
                .attr("height", taskHeight);


            // Drop into place
            stackedTask.transition()
                .delay(function(d, i) { return 10 * i; })
                .attr("transform", function(d, i) { return "translate(0, " + y(i) + ")"; });

            stackedTask.select("rect")
                    .attr("opacity", function(d) { return d.hasCompleted ? 1 : 0.2; });
        });

}