define(["jquery","ui","config","options","graph"], function($,ui,config,options,graph) {
	var graph = config.graph;
	var graphics = config.graphics;

	var pause = function(bool) {
		if (config.paused)
			config.renderer.pause();
		else
			config.renderer.resume();
	}

	$("#menu").draggable();
	$(document).mouseup(function() {
		pause(config.paused);
	});
	$("#pause").change(function() {
		pause(config.paused = this.checked);
	});
	$("#prune").change(function() {
		config.prune = this.checked;
		options.filterByMentions(config.minMentions);
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
	/*
	$("#search").keyup(function() {
	console.log($(this).val());
		var searchVal = $(this).val().toLowerCase();
		graph.forEachNode(function(node) { 
			var name = node.data.name.toLowerCase();
			var nodeMatches = (searchVal.length != 0 && name.indexOf(searchVal) != -1);
			node.degree = nodeMatches ? 0 : Infinity;
			options.showLinked(node,nodeMatches);
		});
	});
	*/
	var selectItem = function(event, ui) {
		options.showLinked(ui.item.node,true);
	};
	$("#search").autocomplete({
		minLength: 1,
		autoFocus: true,
		delay: 50,
		source: function(req,callback) {
			var matcher = new RegExp("^" + req.term, "i");

			var results = [];
			graph.forEachNode(function(node) { 
				if (!node.ui.enabled || !matcher.test(node.data.name))
					return;
				results.push({
					value: node.data.name,
					label: node.data.name,
					node: node
				});
			});
			return callback(results);
		},
		select: selectItem,
		focus: selectItem
	})
	.data("ui-autocomplete")._renderItem = function(ul, item) {
		return $("<li>")
			.append("<a><img src='" + item.node.data.icon + "'> " + item.label + "</a>")
			.appendTo(ul);
	};
});

