#! /usr/bin/env node

var stdio = require('stdio');
var fs = require('fs');
var childProcess = require('child_process');

var infoGetter = require('./infoGetter.js');

var mainCommand = '';
var commandOptions = [];
var child = null;

var ops = stdio.getopt({});

var info = infoGetter.get(ops.args[0]);
if (!info) return;


/*	## _spawnApp
	Relaunches the application ever time it stops.
*/
function _spawnApp() {
	child = childProcess.spawn(mainCommand, commandOptions);
	child.on('close', _spawnApp);
}

/*	## _watchApp
	Stops the application everytime files are modified.
*/
function _watchApp() {
	fs.watch('.', function() {
		child.kill('SIGHUP');
	});
}

var command = info.cmdVal.split(/[\s\t]+/);
mainCommand = command.shift();
commandOptions = command;
_spawnApp();
_watchApp();
