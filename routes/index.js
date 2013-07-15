var pg = require('pg');
var config = require('../config');
var conString = config.conString;
exports.index = function(req, res){
  res.render('home');
};
exports.metrics = function(req, res) {
	var pgclient = new pg.Client(conString);
	pgclient.connect(function(err) {
		pgclient.query("SELECT distinct metric_type FROM metrics ORDER BY metric_type", function(err, result) {
			console.log(JSON.stringify(result.rows));
			res.json("{\"metrics\": " + JSON.stringify(result.rows) + "}");
			pgclient.end();
		});
	});
};
exports.projects = function(req, res) {
	var pgclient = new pg.Client(conString);
	pgclient.connect(function(err) {
		pgclient.query("SELECT distinct pid FROM projects ORDER BY pid", function(err, result) {
			console.log(JSON.stringify(result.rows));
			res.json("{\"projects\": " + JSON.stringify(result.rows) + "}");
			pgclient.end();
		});
	});
};
exports.getMetricData = function(req, res) {
	var pgclient = new pg.Client(conString);
	pgclient.connect(function(err) {
		pgclient.query("SELECT commit_date, metric FROM metrics WHERE metric_type=$1 AND pid=$2 ORDER BY commit_date ASC", [req.query.metric_type, req.query.pid], function(err, result) {
			console.log(req.query.metric_type);
			console.log(req.query.pid);
			console.log(JSON.stringify(result.rows));
			console.log(err);
			res.json("{\"metrics\": " + JSON.stringify(result.rows) + "}");
			pgclient.end();
		});
	});
};
exports.getMetricDataSum = function(req, res) {
	var pgclient = new pg.Client(conString);
	pgclient.connect(function(err) {
		pgclient.query("select date_trunc as commit_date, pid, metric_type, sum(metric)  \
		 as metric from (select date_trunc('day', commit_date), pid, metric_type, metric \
		 from metrics where metric_type=$1 AND pid=$2) as updated group by date_trunc, pid, \
		 metric_type ORDER BY date_trunc ASC", [req.query.metric_type, req.query.pid],
		 function(err, result) {
		 	console.log(req.query.metric_type);
			console.log(req.query.pid);
			console.log(JSON.stringify(result.rows));
			console.log(err);
			res.json("{\"metrics\": " + JSON.stringify(result.rows) + "}");
			pgclient.end();
		 });
	});
}