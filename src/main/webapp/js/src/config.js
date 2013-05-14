define(["viva"], function(Viva) {
	var config = {
		path: "json?user=",
		currentUser: "",
		currentId: 0,
		defaultUser: "twitter",
		minMentions: 3,
		maxMentions: 25,
		nodeSize: 32,
		maxLinkSize: 5,
		font: "Trebuchet MS",
		minOpacity: 0.3,

		graph: Viva.Graph.graph(),
		graphics: Viva.Graph.View.svgGraphics()
	};
	return config;
});
