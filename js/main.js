
var margin = {top: 80, right: 80, bottom: 80, left: 80},
    width = window.innerWidth - margin.left - margin.right,
    height = window.innerHeight - margin.top - margin.bottom;

var x = d3.time.scale().range([0, width])
var    y = d3.scale.ordinal().rangeRoundBands([height, 0], .2)
var    xAxis = d3.svg.axis().scale(x)
    .orient('bottom')
    .tickSize(-height)
var    yAxis = d3.svg.axis().scale(y).orient('left').tickSize(0)
    // .tickSize(-width);


var svg = d3.select("#graph").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
   .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

svg.append("defs")
.append("clipPath")
      .attr("id", "clip")
    .append("rect")
      .attr("width", width)
      .attr("height", height)

d3.csv("data.csv", function(data) {
	var zoom = d3.behavior.zoom()
		.on("zoom", draw);

	_.map(data, function(thing) {
		if(thing["Activity"] === 'Bottle' || thing['Activity'] === 'Nursing') {
			thing.thing = 'Feeding';
		}
		else {
			thing.thing = thing["Activity"]
		}

		return thing;
	})

	var categories = _.sortBy(_.chain(data).pluck("thing").unique().compact().value());
	y.domain(categories);

	var start = d3.min(data, function(d) { 
		return d3.time.day.floor(new Date(d["Start Time"]));
	})
	var end = d3.max(data, function(d) { 
		return d3.time.day.ceil(new Date(d["End Time"]));
	})
	x.domain([start,end]);

	zoom.x(x)
		.scaleExtent(x.range());

	data = _.groupBy(data, function(d) {
		if(new Date(d["Start Time"]).getTime() === new Date(d["End Time"]).getTime()) {
			return 'once';
		}
		else {
			return 'range';
		}
	});

	svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis);

	svg.selectAll('.circle')
		.data(data.once)
		.enter().append('circle')
		.attr('class', 'circle')
		.attr('cx', function(d) {
			return x(new Date(d["Start Time"]))
		})
		.attr('cy', function(d) {
			return y(d.thing) + y.rangeBand()/2
		})
		.attr('r', y.rangeBand()/16)
		.style('fill', function(d) {

			if (d["Activity"] === 'Nursing') {
				return 'blue'
			}
			if(d["Activity"] === 'Bottle') {
				return 'green'
			}

			if(d["Activity"] !== 'Diaper') {
				return 'black';
			}

			switch(d["Extra data"]) {
				case 'Wet':
					return '#EDE35A';
				case 'BM':
					return '#663300';
				default:
					return 'tan'
			}
		})
		.attr('title', 'ou')

	svg.selectAll('.rect') 
		.data(data.range)
		.enter().append('rect')
		.attr('class', 'rect')
		.attr('x', function(d) {
			return x(new Date(d["Start Time"]))
		})
		.attr('y', function(d) {
			return y(d.thing)
		})
		.attr('width', function(d) {
			return x(new Date(d["End Time"])) - x(new Date(d["Start Time"]))
		})
		.attr('height', y.rangeBand())
		.style('fill', function(d) {
			if (d["Activity"] === 'Nursing') {
				return 'blue'
			}
			if(d["Activity"] === 'Bottle') {
				return 'green'
			}
		});


	svg.append("rect")
	    .attr("class", "pane")
	    .attr("width", width)
	    .attr("height", height)
	    .call(zoom);

	function draw() {
		svg.select("g.x.axis").call(xAxis);
		svg.select("g.y.axis").call(yAxis);

		svg.selectAll('.circle')
			.data(data.once)
			.attr('cx', function(d) {
				return x(new Date(d["Start Time"]))
			})
			.attr('cy', function(d) {
				return y(d.thing) + y.rangeBand()/2
			})
			.attr('r', y.rangeBand()/16)

		svg.selectAll('.rect') 
			.data(data.range)
			.attr('x', function(d) {
				return x(new Date(d["Start Time"]))
			})
			.attr('y', function(d) {
				return y(d.thing)
			})
			.attr('width', function(d) {
				return x(new Date(d["End Time"])) - x(new Date(d["Start Time"]))
			})
	}

});

