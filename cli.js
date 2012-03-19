#!/usr/bin/env node
/*jslint nodejs:true */

var cheatmang = require("./cheatmang");

function main() {
	process.stdin.resume();
	process.stdin.setEncoding("UTF8");

	process.stdin.on("data", function(chunk) {
		cheatmang.manaCost(chunk); //, process.stdout.write);
	});

	process.stdin.on("end", function() {});
}

if (!module.parent) { main(); }