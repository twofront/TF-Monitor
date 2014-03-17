#! /usr/bin/env node

var stdio = require('stdio');
var fs = require('fs');
var child_process = require('child_process');

var mainCommand = '';
var commandOptions = [];
var child = null;

// First get the command line options and arguements.
var ops = stdio.getopt({
		'git': {key: 'g', description: 'Pull from git hourly.'},
		'githook': {key: 'h', args: 1, description: 'Pull from git when it changes via a hook.'},
	},
	'[COMMAND] [SOMEID]'
);

if (!ops.args || ops.args.length != 2) {
	console.log('Error: Command takes 2 arguments.');
	return;
}

// For the `start` or `register` command we read the Procfile and
// start the application.

function _spawnApp() {
	console.log('Starting app...');
	child = child_process.spawn(mainCommand, commandOptions);
	child.on('close', _spawnApp);
}

function _watchApp() {
	fs.watch('.', function() {
		console.log('File changed...');
		child.kill('SIGHUP');
	});
}

function startApp() {
	fs.readFile('./Procfile', function (err, data) {
		data = data.toString();
		if (err) throw err;
		var lines = data.split('\n');
		var command = null;
		for (var i=0; i<lines.length; i++) {
			// Here we use replace to get the various parts of our regex
			// (not to actually replace anything)
			lines[i].replace(/([a-zA-Z0-9_]*):[\s\t]*(.*)/, function(all, name, cmd) {
				console.log(all);
				if (name === ops.args[1]) {
					command = cmd.split(/[\s\t]+/);
				}
			});
		}
		if (command) {
			mainCommand = command.shift();
			commandOptions = command;
			_spawnApp();
			_watchApp();
		} else {
			console.log('Error: "'+ops.args[1]+'" not found in "Procfile"!');
		}
	});
}

if (ops.args[0] === 'start' || ops.args[0] === 'register') {
	startApp();
} else {
	console.log('Error: "'+ops.args[0]+'" not found. Remember, this utility is a WIP.');
}
