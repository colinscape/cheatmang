/*jslint nodejs:true */

var http = require("http");

var host = "daccg.com";
exports.host = host;

var api = "/ajax_ccgsearch.php?db=mtg&cardname=";
exports.api = api;

function manaCost(name, callback) {
	console.log("Host: " + host);

	var path = api + name;

	console.log("Path: " + path);

	var options = {
		host: host,
		port: 80,
		path: path
	};

	http.get(options, function(res) {
		console.log("Status code: " + res.statusCode);

		var data = "";

		res.on("data", function(chunk) {
			data += chunk;
		});

		res.on("end", function() {
			console.log("Data: " + data);

			// var o = JSON.parse(res.responseText);
			// 
			// console.log("O: " + o);

			// ...

			// callback("???");			
		});
	});
}

exports.manaCost = manaCost;