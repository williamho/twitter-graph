define(["viva"], function(Viva) {
	var config = {
		path: "json?user=",
		currentUser: "",
		currentId: 0,
		defaultUser: "default",
		minMentions: 5,
		maxMentions: 25,
		nodeSize: 32,
		font: "Trebuchet MS",
		minOpacity: 0.1,

		graph: Viva.Graph.graph(),
		graphics: Viva.Graph.View.svgGraphics()
	};
	return config;
});
