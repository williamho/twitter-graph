define(["viva","config","options"], function(Viva,config,options) {
	var graph = config.graph;
	var graphics = config.graphics;

	return function(data) {
		graph.clear();
		graph.beginUpdate();
		for (var id in data.users) {
			graph.addNode(id, data.users[id]);
		}

		data.links.forEach(function(obj, index) {
			graph.addLink(obj.from, obj.to).mentions = obj.weight;
		});

		graphics.node(function(node) {
			var ui = Viva.Graph.svg('g')
				.attr('opacity', config.minOpacity);
			var text = Viva.Graph.svg('text')
				.text(node.data.name)
				.attr('x',config.nodeSize/2 + 'px')
				.attr('y',config.nodeSize*1.5 + 'px')
			var image = Viva.Graph.svg('image')
				.attr('width', config.nodeSize)
				.attr('height', config.nodeSize)
				.link(node.data.icon);

			if (node.data.name.toLowerCase() == config.currentUser) {
				config.currentNode = node;
				text.attr('font-weight','bold');
				ui.attr('opacity', 1);
			}
			node.isSelected = false;
			ui.append(text);
			ui.append(image);
			ui.enabled = true;

			$(image).hover(
				function() { options.showLinked(node, true); }, // mouseover
				function() { options.showLinked(node, false); } // mouseout
			);
			return ui;
		}).placeNode(function(nodeUI, pos) {
			if (nodeUI.enabled)
				nodeUI.attr('transform', 
					'translate(' + 
						(pos.x-config.nodeSize/2) + ',' + 
						(pos.y-config.nodeSize/2) + 
					')'
				);
			else
				nodeUI.attr('transform', 'scale(0)');
		}); 

		graphics.link(function(link){
			var mentionsPercentile = 1-Math.max(0,config.maxMentions-link.mentions)/config.maxMentions;
			var colorVal = Math.floor(mentionsPercentile*255);
			var size = config.maxLinkSize*mentionsPercentile+1;

			var ui = Viva.Graph.svg('path')
				.attr('opacity', config.minOpacity)
				.attr('stroke', 'rgb(' + colorVal + ',' + (255-colorVal) + ',' + (255-colorVal) + ')')
				.attr('stroke-width', size);
			ui.enabled = link.mentions > config.minMentions;
			return ui;
		}).placeLink(function(linkUI, fromPos, toPos) {
			if (linkUI.enabled) {
				var data = 'M' + fromPos.x + ',' + fromPos.y + 
						   'L' + toPos.x + ',' + toPos.y;
				linkUI.attr('d', data);
			}
			else
				linkUI.attr('d', 'M0,0');
		});

		graph.endUpdate();
		config.renderer.run();
		options.filterByMentions(config.minMentions);
	}
});
