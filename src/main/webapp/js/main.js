require.config({
	catchError: true,
	baseUrl: "js/src",
	shim: {
		viva: {
			deps: ["jquery"],
			exports: "Viva"
		},
		bbq: ["jquery"],
		ui: ["jquery"],
	},
	paths: {
		jquery: "http://code.jquery.com/jquery-1.8.3.min",
		ui: "http://code.jquery.com/ui/1.10.3/jquery-ui.min",
		viva: "../lib/vivagraph.min",
		bbq: "../lib/jquery.ba-bbq.min",
	}
});

requirejs(["graph"]);

