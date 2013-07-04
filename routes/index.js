var pg = require('pg');
var config = require('../config');
var conString = config.conString;
exports.index = function(req, res){
  res.render('home');
};
exports.metrics = function(req, res) {
	var pgclient = new pg.Client(conString);
	pgclient.connect(function(err) {
		pgclient.query("SELECT distinct metric_type FROM metrics", function(err, result) {
			console.log(JSON.stringify(result.rows));
			res.json("{\"metrics\": " + JSON.stringify(result.rows) + "}");
		});
	});
};
exports.projects = function(req, res) {
	var pgclient = new pg.Client(conString);
	pgclient.connect(function(err) {
		pgclient.query("SELECT distinct pid FROM projects", function(err, result) {
			console.log(JSON.stringify(result.rows));
			res.json("{\"projects\": " + JSON.stringify(result.rows) + "}");
		});
	});
};
exports.getMetricData = function(req, res) {
	var pgclient = new pg.Client(conString);
	pgclient.connect(function(err) {
		pgclient.query("SELECT commit_date, metric FROM metrics WHERE metric_type=$1 AND pid=$2", [req.query.metric_type, req.query.pid], function(err, result) {
			console.log(req.query.metric_type);
			console.log(req.query.pid);
			console.log(JSON.stringify(result.rows));
			console.log(err);
			res.json("{\"metrics\": " + JSON.stringify(result.rows) + "}");
		});
	});
};