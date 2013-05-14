define(["jquery","viva","bbq","config","init","options"], function($,Viva,bbq,config,init,options) {
	var graph = config.graph;
	var graphics = config.graphics;

	var loadUser = function(username) {
		$.getJSON(config.path+username, function(data) {
			config.currentUser = username.toLowerCase();
			init(data);
		});
	}

	var query = $.deparam.querystring();
	if (query.hasOwnProperty("user")) {
		if (query.user.toLowerCase() != config.currentUser) 
			loadUser(query.user);
	}
	else if (config.currentUser != config.defaultUser)
		loadUser(config.defaultUser);

	var fragment = $.deparam.fragment();
	// Global minOpacity
	config.prune = fragment.hasOwnProperty("prune");

	// Switch mentions threshold
	if (fragment.hasOwnProperty("mentions")) {
		config.minMentions = parseInt(fragment.mentions);
		options.filterByMentions(config.minMentions);
	}

	// Global minOpacity
	if (fragment.hasOwnProperty("opacity")) {
		options.changeOpacity(parseFloat(fragment.opacity));
	}
});
