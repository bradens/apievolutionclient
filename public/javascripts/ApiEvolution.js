var ApiEvolution = function() {
	this.initializeProjects = function() {
		var slf = this;
		$.ajax({
			dataType: "json",
			url: "projects",
			beforeSend: function() {
				slf.loading();
			},
			type: "GET"
		})
		.done(function(msg) {
			msg = $.parseJSON(msg);
			$(".nav-projects-ul").remove();

			var source = 	"{{#projects}} \
							 	<li><a><span>{{ pid }}<span></a></li> \
							 {{/projects}}";
			var template = Handlebars.compile(source);
			$(".nav-projects-dd").append("<ul class='nav-projects-ul'></ul>");
			var $ul = $(".nav-projects-ul").append(template(msg));
			$(".nav-projects-dd li a").click(function(e) { 
				if ($(e.target).text() === api.CURRENT_PROJECT) {
					// deactivate and return;
					api.CURRENT_PROJECT = null;
					$(e.target).closest('li').removeClass('active');
					return;
				}
				api.CURRENT_PROJECT = $(e.target).text();
				$("#projects-nav").text(api.CURRENT_PROJECT);
				$(".nav-projects-ul li").removeClass("active");
				$(e.target).closest('li').toggleClass("active");
			});
		})
		.fail(function(msg) {
			console.log(msg);
		})
		.always(function(msg) {
			$(".loading").fadeOut();
		});
	};
	this.initializeMetrics = function() {
		var slf = this;
		$.ajax({
			dataType: "json",
			url: "metrics",
			beforeSend: function() {
				slf.loading();
			},
			type: "GET"
		})
		.done(function(msg) {
			msg = $.parseJSON(msg);
			// remove old metrics
			$(".nav-metrics-ul").remove();

			var source = 	"{{#metrics}} \
							 	<li><a><span>{{ metric_type }}</span></a></li> \
							 {{/metrics}}";
			var template = Handlebars.compile(source);
			$(".nav-metrics-dd").append("<ul class='nav-metrics-ul'></ul>");
			var $ul = $(".nav-metrics-ul").append(template(msg));
			$(".nav-metrics-dd li a").click(slf.toggleMetric);
		})
		.fail(function(msg) {
			console.log(msg);
		})
		.always(function(msg) {
			$(".loading").fadeOut();
		});
	};
	this.toggleMetric = function(e) {
		var slf = api;
		$li = $(e.target).closest("li");

		if ($li.hasClass("active")){
			// just remove the graph and return
			$(".container").empty();
			$li.removeClass("active");
			return;
		}

		$a = $(e.target).closest('a');
		$(".nav-metrics-ul li").removeClass("active");
		$li.toggleClass("active");
		metric_type = $a.text();
		$.ajax({
			type: "GET", 
			dataType: "json",
			url: "getMetricData",
			beforeSend: function() {
				slf.loading;
			},
			data: {
				metric_type: metric_type,
				pid: api.CURRENT_PROJECT
			}
		}).done(function(msg) {
			msg = $.parseJSON(msg);
			if (msg.metrics.length === 0){
				$(".no-metrics").fadeIn();
				setTimeout(function() {
					$(".no-metrics").fadeOut();
				}, 1500);
			}
			else {
				slf.drawMetric(metric_type, msg);
			}
		});
	};

	this.loading = function() {
		$(".loading").fadeIn();
	};

	this.drawMetric = function(METRIC_TYPE, data) {
		// Clear the old graph 
		$(".container").empty();

		var margin = {top: 20, right: 20, bottom: 30, left: 50},
	    width = 1170 - margin.left - margin.right,
	    height = 500 - margin.top - margin.bottom;

		var x = d3.time.scale()
		    .range([0, width]);

		var y = d3.scale.linear()
		    .range([height, 0]);

		var xAxis = d3.svg.axis()
		    .scale(x)
		    .orient("bottom");

		var yAxis = d3.svg.axis()
		    .scale(y)
		    .orient("left");

		var area = d3.svg.area()
		    .x(function(d) { return x(new Date(d.commit_date)); })
		    .y0(height)
		    .y1(function(d) { return y(d.metric); });

		var svg = d3.select(".container").append("svg")
		    .attr("width", width + margin.left + margin.right)
		    .attr("height", height + margin.top + margin.bottom)
		  	.append("g")
		    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

			data.metrics.forEach(function(d) {
				d.commit_date = new Date(d.commit_date);
		   		d.metric = + parseInt(d.metric);
			});

			x.domain(d3.extent(data.metrics, function(d) { return d.commit_date; }));
			y.domain([0, d3.max(data.metrics, function(d) { return d.metric; })]);

			svg.append("path")
			  .datum(data.metrics)
			  .attr("class", "area")
			  .attr("d", area);

			svg.append("g")
			  .attr("class", "x axis")
			  .attr("transform", "translate(0," + height + ")")
			  .call(xAxis);

			svg.append("g")
			  .attr("class", "y axis")
			  .call(yAxis)
			.append("text")
			  .attr("transform", "rotate(-90)")
			  .attr("y", 6)
			  .attr("dy", ".71em")
			  .style("text-anchor", "end")
			  .text("Metric");
	};

	this.draw = function() {
		var margin = {top: 20, right: 20, bottom: 30, left: 50},
	    width = 1170 - margin.left - margin.right,
	    height = 500 - margin.top - margin.bottom;

		var parseDate = d3.time.format("%d-%b-%y").parse;

		var x = d3.time.scale()
		    .range([0, width]);

		var y = d3.scale.linear()
		    .range([height, 0]);

		var xAxis = d3.svg.axis()
		    .scale(x)
		    .orient("bottom");

		var yAxis = d3.svg.axis()
		    .scale(y)
		    .orient("left");

		var area = d3.svg.area()
		    .x(function(d) { return x(d.date); })
		    .y0(height)
		    .y1(function(d) { return y(d.close); });

		var svg = d3.select(".container").append("svg")
		    .attr("width", width + margin.left + margin.right)
		    .attr("height", height + margin.top + margin.bottom)
		  .append("g")
		    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		d3.tsv("data.tsv", function(Error, data) {
		  data.forEach(function(d) {
		    d.date = parseDate(d.date);
		    d.close = +d.close;
		  });

		  x.domain(d3.extent(data, function(d) { return d.date; }));
		  y.domain([0, d3.max(data, function(d) { return d.close; })]);

		  svg.append("path")
		      .datum(data)
		      .attr("class", "area")
		      .attr("d", area);

		  svg.append("g")
		      .attr("class", "x axis")
		      .attr("transform", "translate(0," + height + ")")
		      .call(xAxis);

		  svg.append("g")
		      .attr("class", "y axis")
		      .call(yAxis)
		    .append("text")
		      .attr("transform", "rotate(-90)")
		      .attr("y", 6)
		      .attr("dy", ".71em")
		      .style("text-anchor", "end")
		      .text("Price ($)");
		});
	}
};