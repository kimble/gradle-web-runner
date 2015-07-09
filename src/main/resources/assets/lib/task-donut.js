

function createTaskDonut() {
    function isTrue(propertyName) {
        return function(obj) {
            return obj[propertyName] === true;
        };
    }

    var width = 250,
        height = 250,
        radius = Math.min(width, height) / 2;


    var color = d3.scale.ordinal()
        .domain(["Completed", "Candidates", "Blocked", "Running"])
        .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b"]);

    var arc = d3.svg.arc()
        .outerRadius(radius - 10)
        .innerRadius(radius - 60);

    var pie = d3.layout.pie()
        .sort(null)
        .value(function(d) {
            return d.value;
        });


    var svg = d3.select("#taskDonut").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
            .attr("id", "pieChart")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var path = svg.selectAll("path")
        .data(pie([
            { label: 'Completed', value: 0 },
            { label: 'Candidates', value: 0 },
            { label: 'Blocked', value: 1 },
            { label: 'Running', value: 0 }
        ]))
        .enter()
        .append("path");

    path.transition()
        .duration(500)
        .attr("fill", function(d, i) {
            return color(d.data.label);
        })
        .attr("d", arc)
        .each(function(d) { this._current = d; });


    function change(data) {

    }

// Store the displayed angles in _current.
// Then, interpolate from _current to the new angles.
// During the transition, _current is updated in-place by d3.interpolate.

    function arcTween(a) {
        var i = d3.interpolate(this._current, a);
        this._current = i(0);
        return function(t) {
            return arc(i(t));
        };
    }

    // Update
    return function(data) {
        if (data.tasks.length > 0) {
            var summary = [
                {
                    label: 'Completed',
                    value: data.tasks.filter(isTrue("hasCompleted")).length
                },
                {
                    label: 'Candidates',
                    value: data.tasks.filter(isTrue("isCandidate")).length
                },
                {
                    label: 'Blocked',
                    value: data.tasks.filter(isTrue("isBlocked")).length
                },
                {
                    label: 'Running',
                    value: data.tasks.filter(isTrue("isRunning")).length
                }
            ];

            path.data(pie(summary));
            path.transition().duration(2000).attrTween("d", arcTween); // redraw the arcs
        }
    }
}