define(["viva","bbq"], function(Viva,bbq) {
	var graph = Viva.Graph.graph();

	var reset = function() {
		graph.forEachNode(function(node){
			graph.removeNode(node.id);
		});
	}

	var loadUser = function(username) {
		$.getJSON('get?user='+username, function(data) {
			reset();

			for (var id in data.users) {
				graph.addNode(id, data.users[id]);
			}

			data.links.forEach(function(obj, index) {
				if (obj.weight > 25) 
					graph.addLink(obj.from, obj.to).mentions = obj.weight;
			});
		});
	}

	$(function(){
		$(window).bind("hashchange", function(e) {
			var params = $.deparam.fragment();
			if (params.hasOwnProperty("user"))
				loadUser(params.user)
		});

		$(window).trigger("hashchange");
	});





	var maxMentions = 0;
	graph.forEachLink(function(link) {
		maxMentions = Math.max(maxMentions,link.mentions);
	});
	maxMentions = Math.min(25,maxMentions);

	var graphics = Viva.Graph.View.svgGraphics();
	var nodeSize = 32;

	graphics.node(function(node) {
		var ui = Viva.Graph.svg('g')
			.attr('opacity', getOpacity(false));
		var text = Viva.Graph.svg('text')
			.text(node.data.name)
			.attr('font-family', 'Trebuchet MS')
			.attr('x',nodeSize/2 + 'px')
			.attr('y',nodeSize*1.5 + 'px')
			.attr('text-anchor','middle');
		var image = Viva.Graph.svg('image')
			.attr('width', nodeSize)
			.attr('height', nodeSize)
			.link(node.data.icon);

		ui.append(text);
		ui.append(image);

		$(ui).hover(
			function() { showLinked(node, true); }, // mouseover
			function() { showLinked(node, false); } // mouseout
		);
		return ui;
	}).placeNode(function(nodeUI, pos) {
		nodeUI.attr('transform', 
			'translate(' + (pos.x-nodeSize/2) + ',' + (pos.y-nodeSize/2) + ')'
		);
	}); 

	graphics.link(function(link){
		var mentionsPercentile = 1-Math.max(0,maxMentions-link.mentions)/maxMentions;
		var colorVal = Math.floor((1-mentionsPercentile)*255);
		var size = 3*mentionsPercentile+1;

		return Viva.Graph.svg('path')
			.attr('opacity', getOpacity(false))
			//.attr('stroke', 'rgb(' + (255-colorVal) + ',' + Math.floor(colorVal/5) + ',' + colorVal + ')')
			.attr('stroke', 'rgb(' + (255-colorVal) + ',' + (colorVal) + ',' + (colorVal) + ')')
			.attr('stroke-width', size);
	}).placeLink(function(linkUI, fromPos, toPos) {
		var data = 'M' + fromPos.x + ',' + fromPos.y + 
				   'L' + toPos.x + ',' + toPos.y;
		linkUI.attr('d', data);
	});

	var getOpacity = function(isOpaque) {
		return isOpaque ? '1.0' : '0.1';
	}

	var showLinked = function(node, isOn) {
		node.ui.attr('opacity', getOpacity(isOn))
		graph.forEachLinkedNode(node.id, function(node, link){
			link && link.ui && link.ui.attr('opacity', getOpacity(isOn));
			node.ui.attr('opacity', getOpacity(isOn))
		});
	};

	var renderer = Viva.Graph.View.renderer(graph, { graphics : graphics });
	renderer.run();

});
