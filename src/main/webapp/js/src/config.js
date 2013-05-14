define(["viva"], function(Viva) {
	var graph = Viva.Graph.graph();
	var graphics = Viva.Graph.View.svgGraphics();
	var renderer = Viva.Graph.View.renderer(graph, { 
		container: document.getElementById('content'),
		graphics: graphics 
	});
	var config = {
		path: "json?user=",
		currentUser: "",
		currentId: 0,
		defaultUser: "twitter",
		minMentions: 3,
		maxMentions: 50,
		nodeSize: 32,
		maxLinkSize: 5,
		minOpacity: 0.3,
		incomingMultiplier: 0.6,
		prune: false,

		graph: graph,
		graphics: graphics,
		renderer: renderer,
	};
	return config;
});
