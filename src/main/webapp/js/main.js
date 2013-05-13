require.config({
	catchError: true,
	baseUrl: "js/src",
	shim: {
		viva: {
			deps: ["jquery"],
			exports: "Viva"
		},
		bbq: ["jquery"],
	},
	paths: {
		jquery: "http://code.jquery.com/jquery-1.8.3.min",
		viva: "../lib/vivagraph.min",
		bbq: "../lib/jquery.ba-bbq.min",
	}
});

requirejs(["graph"]);

