define(["jquery","ui","viva","bbq","config","init","options"], function($,ui,Viva,bbq,config,init,options) {
	var graph = config.graph;
	var graphics = config.graphics;

	var loadUser = function(username) {
		$.getJSON(config.path+username, function(data) {
			config.currentUser = username.toLowerCase();
			init(data);
		});
	}

	$(function(){
		$("#menu").draggable().resizable();
		var slider = $("#mentions-slider").slider({
			min: 0,
			max: 100,
			value: config.minMentions,
			range: "min",
			slide: function(event, ui) {
				$("#mentions").text(ui.value);
				window.location = $.param.fragment(window.location.href, {mentions: ui.value});
			}
		});
		var slider = $("#opacity-slider").slider({
			min: 0,
			max: 1,
			value: config.minOpacity,
			step: 0.05,
			range: "min",
			slide: function(event, ui) {
				$("#opacity").text(ui.value);
				window.location = $.param.fragment(window.location.href, {opacity: ui.value});
			}
		});

		var query = $.deparam.querystring();
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
			if (query.hasOwnProperty("user")) {
				if (query.user.toLowerCase() != config.currentUser) 
					loadUser(query.user);
			}
			else if (config.currentUser != config.defaultUser)
				loadUser(config.defaultUser);
		});

		$.hashchangeDelay = 1000;
		$(window).trigger("hashchange");
	});
});
