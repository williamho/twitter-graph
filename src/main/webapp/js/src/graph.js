define(["jquery","viva","bbq","config","init"], function($,Viva,bbq,config,init) {
	var graph = config.graph;
	var graphics = config.graphics;

	var loadUser = function(username) {
		$.getJSON(config.path+username, function(data) {
			config.currentUser = username.toLowerCase();
			console.log(config.currentUser);
			init(data);
		});
	}

	$(function(){
		$(window).bind("hashchange", function(e) {
			var params = $.deparam.fragment();

			// Switch user
			if (params.hasOwnProperty("user") && 
			    params.user.toLowerCase() != config.currentUser) 
				loadUser(params.user);
			else 
				loadUser(config.defaultUser);

			// Switch mentions threshold
			if (params.hasOwnProperty("mentions")) {
				var mentions = parseInt(params.mentions);
				if (mentions != config.minMentions)
					config.minMentions = mentions;
				filterByMentions(config.minMentions);
			}
		});

		$(window).trigger("hashchange");
	});

	filterByMentions = function(threshold) {
		graph.forEachLink(link, function(link) {
			if (link.mentions < threshold)
				link.ui.attr("opacity", 0);
		});
	};
});
