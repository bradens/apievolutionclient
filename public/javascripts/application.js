var api;
$(document).ready(function() {
	api = new ApiEvolution();
	api.CURRENT_PROJECT = null;
	api.SLIDING_TIME_WINDOW = 50; // default of 50 commits
	api.initializeProjects();
	api.initializeMetrics();
	api.initializeSlider();
	api.draw();
});