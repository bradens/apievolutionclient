var StaticPages = module.exports = function StaticPages(){};
 
StaticPages.prototype = {
	initPages: function(app){
		// Routes
		app.get('/', function(req, res){
		  res.render('index', {
		    title: 'Home'
		  });
		});
		
		app.get('/About', function(req, res){
		  res.render('about', {
		    title: 'About'
		  });
		});
	}	
};