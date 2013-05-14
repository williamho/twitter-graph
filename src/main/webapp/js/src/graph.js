define(["jquery","viva","bbq","config","init","options"], function($,Viva,bbq,config,init,options) {
	var graph = config.graph;
	var graphics = config.graphics;

	var loadUser = function(username) {
		$.getJSON(config.path+username, function(data) {
			config.currentUser = username.toLowerCase();
			init(data);
		});
	}

	$(function(){
		$(window).bind("hashchange", function(e) {
			var params = $.deparam.fragment();

			// Global minOpacity
			config.prune = params.hasOwnProperty("prune");

			// Switch mentions threshold
			if (params.hasOwnProperty("mentions")) {
				var mentions = parseInt(params.mentions);
				if (mentions != config.minMentions){ 
					config.minMentions = mentions;
					options.filterByMentions(config.minMentions);
				}
			}

			// Global minOpacity
			if (params.hasOwnProperty("opacity")) 
				options.changeOpacity(parseFloat(params.opacity));

			// Switch user
			if (params.hasOwnProperty("user")) {
				if (params.user.toLowerCase() != config.currentUser) 
					loadUser(params.user);
			}
			else 
				loadUser(config.defaultUser);

		});

		$(window).trigger("hashchange");
	});
});
