var drawReport = (function() {
    "use strict";



    var taskColor = (function() {
        var mapping = {
            'compileJava': '#216572',
            'classes': '#B8EF25',
            'jar': '#F54550',

            'processResources': '#F56406',

            'test': '#88C454',
            'testClasses': '#5D9B27',
            'compileTestJava': '#64C755',
            'processTestResources': '#5D9B65',

            'build': '#CD63E9'
        };

        return function(d) {
            return mapping.hasOwnProperty(d.name) ? mapping[d.name] : "#333";
        }
    })();



    function attrNamed(name) {
        return function(obj) {
            return obj[name];
        }
    }


    // Plot tasks on chart
    function plot(tasks) {
        var max = d3.max(tasks, attrNamed("finished"));
        var min = d3.min(tasks, attrNamed("started"));

        var threadNames = tasks.map(function(obj) { return obj.threadName; });
        threadNames = threadNames.filter(function(v,i) { return threadNames.indexOf(v) == i; });

        var rowHeight = 30;

        var w = $("body").width();
        var h = 30 + (threadNames.length * rowHeight * 2);




        var x = d3.scale.linear()
            .domain([min, max])
            .range([0, w]);

        var y = d3.scale.linear()
            .domain([0, threadNames.length])
            .range([30, h]);

        var calculateWidth = function(d) {
            return x(d.finished)- x(d.started);
        };

        var xAxis = d3.svg.axis()
            .tickFormat(function(v) {
                return v / 1000 + "s";
            })
            .tickSize(3)
            .orient("top")
            .scale(x);

        var zoom = d3.behavior.zoom()
            .x(x)
            .on("zoom", onZoom);


        var svg = d3.select("#scene")
            .append("svg")
            .attr("width", w)
            .attr("height", h)
            .call(zoom);


        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0, 15)")
            .call(xAxis);


        // Figures out how many characters to show
        function boxText(d) {
            var width = x(d.finished)- x(d.started);
            var maxCharacters = width / 12; // Could probably use svg to calculate the actual with of the text..?
            var text = d.path;

            if (text.length > maxCharacters) {
                text = text.substring(0, maxCharacters);

                if (text.length > 2) {
                    text += text.substr(0, text.length - 2) + "..";
                }
            }

            return text;
        }



        function onZoom() {
            svg.select(".axis").call(xAxis);

            var task = svg.selectAll("g.task")
                .data(tasks, attrNamed("path"))
                .attr("transform", function(d) {
                    return "translate(" + x(d.started) + "," + y(threadNames.indexOf(d.threadName)) + ")";
                });

            task.select("rect").attr("width", calculateWidth);
            task.select("text.path").text(boxText);
        }



        var enter = svg.selectAll("g.task")
            .data(tasks, attrNamed("path"))
            .enter();


        var taskGroup = enter.append("g")
            .attr("class", "task")
            .attr("transform", function(d) {
                return "translate(" + x(d.started) + "," + y(threadNames.indexOf(d.threadName)) + ")";
            });


        var infoGroup = taskGroup.append("g")
            .attr("class", "task-info")
            .attr("data-path", attrNamed("path"))
            .attr("transform", "translate(0, " + (rowHeight * 1.4) + ")");

        infoGroup.append("text")
            .text(function(d) {
                return d.path;
            });

        infoGroup.append("text")
            .attr("y", 15)
            .text(function(d) {
                return (d.finished - d.started) + " ms";
            });


        var eg = taskGroup.append("g");


        eg.append("rect")
            .attr("x", "0")
            .attr("y", "0")
            .attr("rx", 4)
            .attr("ry", 4)
            .attr("width", calculateWidth)
            .attr("height", rowHeight)
            .style("fill", taskColor);


        eg.append("text")
            .attr("class", "path")
            .attr("x", 5)
            .attr("y", (rowHeight / 2) + 5)
            .attr("text-anchor", "start")
            .attr("fill", "white")
            .text(boxText);


        // Show additional information
        eg.on('mouseover', function(d) {
            d3.selectAll('g.task')
                .classed('blurred', function(d2) {
                    return d.path != d2.path && d.dependsOn.indexOf(d2.path) < 0;
                });

            d3.select(this).classed("focused", true);
            d3.select(".task-info[data-path='" + d.path + "']")
                .classed("active", true);
        });

        // Hide additional information
        eg.on('mouseout', function() {
            d3.selectAll('g.task')
                .classed("blurred", false)
                .classed("focused", false);

            d3.selectAll(".task-info")
                .classed("active", false);
        });

    }


    return function(updatedMetadata, tasks) {
        plot(tasks);
    }
})();



var createParallelTasks = function (pubsub) {
    "use strict";





    var data = (function () {
        var state = {
            metadata: {
                project: null,
                description: null,
                timestamp: null,
                directory: null,
                startParameterTaskNames: [ "xx" ]
            },
            tasks: [ ]
        };

        var taskMap = { };

        var findTask = function(path) {
            if (taskMap.hasOwnProperty(path)) {
                return taskMap[path];
            }
            else {
                throw "No such task: " + path + ", known tasks: " + Object.keys(taskMap).join(", ");
            }
        };

        return {
            settingsReady : function (event) {
                var settings = event.settings;

                state.metadata.startParameterTaskNames = settings.taskNames;
                state.metadata.directory = settings.directory;
                state.metadata.timestamp = event.timestamp;
            },

            addTasks : function(tasks) {
                tasks.forEach(function (task) {
                    var taskInstance = {
                        name: task.name,
                        path: task.path,
                        group: task.group,
                        description: task.description,

                        threadName: null,
                        started: null,
                        dependsOn: task.dependsOn
                    };

                    state.tasks.push(taskInstance);
                    taskMap[task.path] = taskInstance;
                });
            },

            taskStarted : function(event) {
                var task = findTask(event.path);
                task.started = event.timestamp - state.metadata.timestamp;
                task.threadName = event.threadName
            },

            taskCompleted : function (event) {
                var task = findTask(event.path);
                task.finished = event.timestamp - state.metadata.timestamp;
            },

            state : state
        };
    })();



    var taskGraphReady = pubsub.takeOne("TaskGraphReady");
    var buildCompleted = pubsub.takeOne("GradleBuildCompleted");

    taskGraphReady.map(".tasks").assign(data, "addTasks");

    pubsub.stream("TaskStarting")
        .takeUntil(buildCompleted)
        .assign(data, "taskStarted");

    pubsub.stream("TaskCompleted")
        .takeUntil(buildCompleted)
        .assign(data, "taskCompleted");

    pubsub.takeOne("SettingsReady")
        .assign(data, "settingsReady");

    pubsub.takeOne("SettingsReady")
        .map(".settings.projectName")
        .onValue(function (name) {
            $(".project-name").html(name);
        });


    buildCompleted.onValue(function() {
        drawReport(data.state.metadata, data.state.tasks);
    });

};
