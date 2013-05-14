define(["viva","config"], function(Viva,config) {
	var graph = config.graph;
	var graphics = config.graphics;

	var showLinked = function(node, isOn) {
		var opacity = isOn ? 1.0 : config.minOpacity;

		if (node != config.currentNode)
			node.ui.attr('opacity', opacity)
		graph.forEachLinkedNode(node.id, function(node, link){
			link && link.ui && link.ui.attr('opacity', opacity);
			if (node != config.currentNode)
				node.ui.attr('opacity', opacity)
		});
	};

	return function(data) {
		graph.forEachNode(function(node){
			graph.removeNode(node.id);
		});

		for (var id in data.users) {
			graph.addNode(id, data.users[id]);
		}

		data.links.forEach(function(obj, index) {
			if (obj.weight > config.minMentions)
				graph.addLink(obj.from, obj.to).mentions = obj.weight;
		});

		graphics.node(function(node) {
			var ui = Viva.Graph.svg('g')
				.attr('opacity', config.minOpacity);
			var text = Viva.Graph.svg('text')
				.text(node.data.name)
				.attr('font-family', config.font)
				.attr('x',config.nodeSize/2 + 'px')
				.attr('y',config.nodeSize*1.5 + 'px')
				.attr('text-anchor','middle');
			var image = Viva.Graph.svg('image')
				.attr('width', config.nodeSize)
				.attr('height', config.nodeSize)
				.link(node.data.icon);

			if (node.data.name.toLowerCase() == config.currentUser) {
				config.currentNode = node;
				text.attr('font-weight','bold');
				ui.attr('opacity', 1);
			}

			ui.append(text);
			ui.append(image);

			$(ui).hover(
				function() { showLinked(node, true); }, // mouseover
				function() { showLinked(node, false); } // mouseout
			);
			return ui;
		}).placeNode(function(nodeUI, pos) {
			nodeUI.attr('transform', 
				'translate(' + (pos.x-config.nodeSize/2) + ',' + (pos.y-config.nodeSize/2) + ')'
			);
		}); 

		graphics.link(function(link){
			var mentionsPercentile = 1-Math.max(0,config.maxMentions-link.mentions)/config.maxMentions;
			var colorVal = Math.floor(mentionsPercentile*255);
			var size = config.maxLinkSize*mentionsPercentile+1;

			return Viva.Graph.svg('path')
				.attr('opacity', config.minOpacity)
				.attr('stroke', 'rgb(' + colorVal + ',' + (255-colorVal) + ',' + (255-colorVal) + ')')
				.attr('stroke-width', size);
		}).placeLink(function(linkUI, fromPos, toPos) {
			var data = 'M' + fromPos.x + ',' + fromPos.y + 
					   'L' + toPos.x + ',' + toPos.y;
			linkUI.attr('d', data);
		});

		var renderer = Viva.Graph.View.renderer(graph, { graphics : graphics });
		renderer.run();
	}
});
