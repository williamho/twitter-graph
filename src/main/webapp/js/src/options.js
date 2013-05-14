define(["config"], function(config) {
	var graph = config.graph;
	var graphics = config.graphics;

	return {
		changeOpacity: function(opacity) {
			config.minOpacity = opacity;
			graph.forEachLink(function(link) { 
				if (link.ui.enabled)
					link.ui.attr("opacity", opacity); 
			});
			graph.forEachNode(function(node) { 
				if (node != config.currentNode)
					node.ui.attr("opacity", opacity); 
			});
		},

		filterByMentions: function(threshold) {
			graph.forEachLink(function(link) {
				link.ui.enabled = (link.mentions >= threshold);
				//link.ui && link.ui.attr("opacity", link.ui.enabled ? config.minOpacity : 0);
			});
			graph.forEachNode(function(node) {
				if (node == config.currentNode)
					return;

				var numLinks = 0;
				graph.forEachLinkedNode(node.id, function(linkedNode, link){ 
					if (link.ui.enabled && linkedNode.ui !== node.ui)
						numLinks++; 
				});
				node.ui.enabled = (numLinks > 0);
				//node.ui.attr("opacity", node.ui.enabled ? config.minOpacity : 0);

				if (config.prune && !node.ui.enabled) 
					graph.removeNode(node.id);
			});
		}
	}
});
