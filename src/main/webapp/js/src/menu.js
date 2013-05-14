define(["jquery","ui","config","options","graph"], function($,ui,config,options,graph) {
	var graph = config.graph;
	var graphics = config.graphics;

	$("#menu").draggable().resizable();
	var slider = $("#mentions-slider").slider({
		min: 0,
		max: 100,
		value: config.minMentions,
		range: "min",
		slide: function(event, ui) {
			options.filterByMentions(ui.value);
		}
	});
	var slider = $("#opacity-slider").slider({
		min: 0,
		max: 1,
		value: config.minOpacity,
		step: 0.05,
		range: "min",
		slide: function(event, ui) {
			options.changeOpacity(ui.value);
		}
	});
});

