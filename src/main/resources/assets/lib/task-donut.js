

function createTaskDonut(pubsub) {
    function isTrue(propertyName) {
        return function (obj) {
            return obj[propertyName] === true;
        };
    }

    var width = 300,
        height = 300,
        radius = Math.min(width, height) / 2.5;

    var labelr = 100;


    var color = d3.scale.ordinal()
        .domain(["Completed", "Ready", "Blocked", "Running"])
        .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b"]);

    var arc = d3.svg.arc()
        .outerRadius(radius - 10)
        .innerRadius(radius - 60);

    var pie = d3.layout.pie()
        .sort(null)
        .value(function (d) {
            return d.value;
        });


    var svg = d3.select("#taskDonut").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("id", "pieChart")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var initialData = [
        { label: 'Completed', value: 0 },
        { label: 'Ready', value: 0 },
        { label: 'Blocked', value: 1 },
        { label: 'Running', value: 0 }
    ];

    var path = svg.selectAll("path")
        .data(pie(initialData))
        .enter()
        .append("path");

    path.transition()
        .duration(500)
        .attr("fill", function (d) { return color(d.data.label); })
        .attr("d", arc)
        .each(function (d) { this._current = d; });



    // Store the displayed angles in _current.
    // Then, interpolate from _current to the new angles.
    // During the transition, _current is updated in-place by d3.interpolate.

    function arcTween(a) {
        var i = d3.interpolate(this._current, a);
        this._current = i(0);
        return function (t) {
            return arc(i(t));
        };
    }





    ////// Lables

    svg.append("g").attr("class", "labels");

    var text = svg.select(".labels")
        .selectAll("text")
        .data(pie(initialData), function(d) { return d.data.label; });

    text.enter()
        .append("text")
        .attr("dy", ".35em")
        .attr("visibility", function(d) {
            return (d.endAngle - d.startAngle) > (Math.PI / 8) ? "visible" : "hidden";
        })
        .text(function(d) {
            return d.data.label;
        });





    pubsub.stream("task-state-update")
        .throttle(2000)
        .onValue(function (tasks) {
            var summary = [
                {
                    label: 'Completed',
                    value: tasks.filter(isTrue("hasCompleted")).length
                },
                {
                    label: 'Ready',
                    value: tasks.filter(isTrue("isReady")).length
                },
                {
                    label: 'Blocked',
                    value: tasks.filter(isTrue("isBlocked")).length
                },
                {
                    label: 'Running',
                    value: tasks.filter(isTrue("isRunning")).length
                }
            ];

            path.data(pie(summary));
            path.transition()
                .duration(2000)
                .attrTween("d", arcTween); // redraw the arcs



            // Labels

            text.data(pie(summary), function(d) { return d.data.label; });

            text.transition()
                .duration(2000)
                .attr("transform", function(d) {
                    var c = arc.centroid(d),
                        x = c[0],
                        y = c[1],
                        h = Math.sqrt(x*x + y*y);

                    return "translate(" + (x/h * labelr) +  ',' + (y/h * labelr) +  ")";
                })
                .attr("text-anchor", function(d) {
                    return (d.endAngle + d.startAngle) / 2 > Math.PI ? "end" : "start";
                })
                .attr("visibility", function(d) {
                    return (d.endAngle - d.startAngle) > (Math.PI / 10) ? "visible" : "hidden";
                });
        });


}