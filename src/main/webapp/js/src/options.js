define(["jquery","bbq","config"], function($,bbq,config) {
	var graph = config.graph;
	var graphics = config.graphics;

	var updateURL = function(property) {
		window.location = $.param.fragment(window.location.href, property);
	}

	return {
		showLinked: function(node, isOn) {
			if (config.selectedNode && node !== config.selectedNode) { // Deselect current node
				this.showLinked(config.selectedNode, false);
			}
			if (!node.ui.enabled) return;
			var opacity = isOn ? 1.0 : config.minOpacity;

			graph.forEachLinkedNode(node.id, function(linkedNode, link){
				if (!link.ui.enabled || linkedNode.ui === node.ui) return;
				var opacity = isOn ? 1.0 : config.minOpacity;

				var incomingMultiplier = (link.fromId !== node.id) ? config.incomingMultiplier : 1;
					
				link.ui && link.ui.attr('opacity', incomingMultiplier*opacity);
				if (linkedNode.ui.enabled && linkedNode != config.currentNode)
					linkedNode.ui.attr('opacity', incomingMultiplier*opacity)
			});
			if (node != config.currentNode) // currentNode should always be opaque
				node.ui.attr('opacity', opacity)
			config.selectedNode = node;
		},

		changeOpacity: function(opacity) {
			if (typeof opacity === 'undefined')
				opacity = config.minOpacity;
			graph.beginUpdate();
			config.minOpacity = opacity;
			graph.forEachLink(function(link) { 
				if (link.ui.enabled)
					link.ui.attr("opacity", opacity); 
			});
			graph.forEachNode(function(node) { 
				if (node != config.currentNode)
					node.ui.attr("opacity", opacity); 
			});
			updateURL({opacity: opacity});
			$("#opacity").html(opacity);
			graph.endUpdate();
		},

		filterByMentions: function(threshold) {
			graph.beginUpdate();
			config.minMentions = threshold;
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
			updateURL({mentions: threshold});
			$("#mentions").html("&#8805;" + threshold);
			graph.endUpdate();
			config.renderer.rerender();
		}
	}
});
