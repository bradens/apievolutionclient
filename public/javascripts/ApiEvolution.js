var ApiEvolution = function() {
	this.initializeSlider = function() {
		$(".slider").slider({
			min: 0,
			max: 400,
			step: 1, 
			orientation: "horizontal",
			value: 50,
			handle: "circle"
		}).on("slideStop", function(e) {
			api.SLIDING_TIME_WINDOW = $(e.target).val();
			api.drawMetric(api.current_metric, api.current_data);
		});
	};
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
					$("#current-project").text('Projects');
					return;
				}
				api.CURRENT_PROJECT = $(e.target).text();
				$("#current-project").text(api.CURRENT_PROJECT);
				$(".nav-projects-ul li").removeClass("active");
				$(e.target).closest('li').toggleClass("active");

				// Redraw the metric
				api.loadMetricData(api.current_metric, api.CURRENT_PROJECT);
			});

			// Select an initial project
			$(".nav-projects-dd li a").first().click();
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

			function selectFirstMetric() {
				if (!api.CURRENT_PROJECT) {
					setTimeout(selectFirstMetric,100);
				}
				else {
					$(".nav-metrics-dd li a").first().click();
				}
			};
			selectFirstMetric();
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
			$("#current-metric").text("Metrics");
			$(".container.graph").empty();
			$li.removeClass("active");
			return;
		}

		$a = $(e.target).closest('a');
		$(".nav-metrics-ul li").removeClass("active");
		$li.toggleClass("active");
		metric_type = $a.text();
		$("#current-metric").text(metric_type);

		slf.loadMetricData(metric_type, api.CURRENT_PROJECT);
	};

	this.loadMetricData = function(metric_type, project_id) {
		var slf = this;
		$.ajax({
			type: "GET", 
			dataType: "json",
			url: "getMetricData",
			beforeSend: function() {
				slf.loading;
			},
			data: {
				metric_type: metric_type,
				pid: project_id
			}
		}).done(function(msg) {
			msg = $.parseJSON(msg);
			api.current_data = msg;
			api.current_metric = metric_type;
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
	}

	this.loading = function() {
		$(".loading").fadeIn();
	};

	this.drawMetric = function(METRIC_TYPE, data) {
		// Clear the old graph 
		$(".container.graph").empty();

		var margin = {top: 20, right: 20, bottom: 30, left: 50},
	    width = 1170 - margin.left - margin.right,
	    height = 500 - margin.top - margin.bottom;

	    var slidemetrics = [];

	    for (var i = 0;i < data.metrics.length;i++) {
	    	var sum = 0;
	    	for (var j = i-api.SLIDING_TIME_WINDOW;j <= i;j++) {
	    		if (data.metrics[j] !== undefined && data.metrics[j] !== null) {
	    			// we have a valid point
	    			sum += data.metrics[j].metric;
	    		}
	    	}
	    	slidemetrics.push({commit_date: new Date(data.metrics[i].commit_date), metric: sum});
	    }

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

			x.domain(d3.extent(slidemetrics, function(d) { return d.commit_date; }));
			y.domain([0, d3.max(slidemetrics, function(d) { return d.metric; })]);

			svg.append("path")
			  .datum(slidemetrics)
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
			  .text(METRIC_TYPE);
	};
};