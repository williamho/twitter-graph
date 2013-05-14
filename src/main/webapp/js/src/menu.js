define(["jquery","ui","config","options","graph"], function($,ui,config,options,graph) {
	var graph = config.graph;
	var graphics = config.graphics;

	var pause = function(bool) {
		if (config.paused)
			config.renderer.pause();
		else
			config.renderer.resume();
	}

	$("#menu").draggable().resizable();
	$(document).mouseup(function() {
		pause(config.paused);
	});
	$("#pause").change(function() {
		pause(config.paused = this.checked);
	});
	$("#mentions-slider").slider({
		min: 0,
		max: 100,
		value: config.minMentions,
		range: "min",
		slide: function(event, ui) {
			options.filterByMentions(ui.value);
		}
	});
	$("#opacity-slider").slider({
		min: 0,
		max: 1,
		value: config.minOpacity,
		step: 0.05,
		range: "min",
		slide: function(event, ui) {
			options.changeOpacity(ui.value);
		}
	});
	$("#search").keyup(function() {
		var searchVal = $(this).val().toLowerCase();
		graph.forEachNode(function(node) { 
			if (searchVal.length > 1 && node.data.name.toLowerCase().indexOf(searchVal) !== -1)
				options.showLinked(node,true);
			else
				options.showLinked(node,false);
		});
	});
});

