/**
 * Module dependencies.
 */
var express = require('express')
  , routes = require('./routes')
  , exphbs  = require('express3-handlebars')
  , http = require('http')
  , path = require('path');    

app = express();
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.get('/', routes.index);
app.get('/metrics', routes.metrics);
app.get('/projects', routes.projects);
app.get('/getMetricData', routes.getMetricData);
app.get('/getMetricDataSum', routes.getMetricDataSum);

app.configure(function(){
	app.use(express.static(path.join(__dirname, 'public')));
});


app.listen(3000);