var api;
$(document).ready(function() {
	api = new ApiEvolution();
	api.CURRENT_PROJECT = null;
	api.initializeProjects();
	api.initializeMetrics();
	api.draw();
});