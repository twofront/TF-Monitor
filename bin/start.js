#! /usr/bin/env node

var stdio = require('stdio');
var fs = require('fs');
var childProcess = require('child_process');

var tfmonitor = require('../');

var mainCommand = '';
var commandOptions = [];
var child = null;

var launchWait = null;
var waitTime = 1.0;

var ops = stdio.getopt({});

var info = tfmonitor.procfile.getCommand(ops.args[0]);
if (!info) return;


function spawnApp() {
	var d = new Date();
	console.log('Starting at '+
		d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()+' '+
		d.getHours()+':'+d.getMinutes()+':'+d.getSeconds()
	);
	child = childProcess.spawn(mainCommand, commandOptions);
	child.on('error', restartApp);
	child.on('close', restartApp);
}

/*	## restartApp
	Relaunches the application every time it stops, slowly increasing the
	wait time if it crashes repeatedly.
*/
function restartApp() {
	if (launchWait !== null) clearTimeout(launchWait);
	launchWait = setTimeout(function() {
		spawnApp();
		// If the app keeps crashing shortly after launch keep doubling
		// the amount of time before a restart is attempted up to 1024
		// seconds (~17 minutes).
		waitTime = waitTime < 1024 ? waitTime*2 : waitTime;
		launchWait = setTimeout(function() {
			// The relaunch wait time resets to 1 second if the application
			// hasn't crashed for 5 minutes.
			waitTime = 1.0;
			launchWait = null;
		}, 5*60*1000);
	}, waitTime*1000);
}

/*	## watchApp
	Stops the application everytime files are modified.
*/
function watchApp() {
	fs.watch('.', function(event, filename) {
		// Ignore files ending in .log or .err
		if (
			filename.indexOf('.log', filename.length-4) === -1 &&
			filename.indexOf('.err', filename.length-4) === -1 &&
			filename.indexOf('.out', filename.length-4) === -1
		) {
			child.kill('SIGTERM');
		}
	});
}

/*	## shutdown
	Prepares to close TF Monitor.
*/
function shutdown() {
	console.log('Shutting down gracefully...');
	child.kill('SIGTERM');
	process.exit();
}

// The code crashes on its own.
// process.on("uncaughtException", shutdown);
// The ctrl-c signal.
process.on("SIGINT", shutdown);
// The polite way to ask a program to shutdown. (kill uses this)
process.on("SIGTERM", shutdown);

// SIGQUIT is the ctrl-\ signal
// SIGKILL is the forceful way to shutdown. (kill -9 uses this)
// SIGHUP means the controlling terminal was closed.

var command = info.cmdVal.split(/[\s\t]+/);
mainCommand = command.shift();
// On boot we need to pass the full path...
if (mainCommand === 'node') {
	mainCommand = '/usr/local/bin/node';
}
commandOptions = command;
spawnApp();
watchApp();
