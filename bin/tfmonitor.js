#! /usr/bin/env node

var stdio = require('stdio');
var fs = require('fs');
var childProcess = require('child_process');
var tfmonitor = require('../');

var appName = null;
var cmdName = null;
var cmdVal = null;

// First get the command line options and arguements.
var ops = stdio.getopt({
		'git': {key: 'g', description: 'Pull from git hourly.'},
		'githook': {
			key: 'h', args: 1,
			description: 'Pull from git when it changes and notifies us via a hook.'
		},
		'foreground': {
			key: 'f', description: 'Use with "start" to keep process running in the terminal.'
		},
		'log': {
			key: 'l',
			description: 'Write output to tfmonitor.log and tfmonitor.err when using start command.'
		}
	},
	'[COMMAND] [SOMEID]'
);

if (!ops.args || ops.args.length !== 2) {
	console.log('Error: Command takes 2 arguments.');
	return;
}

// Unless we are using the list command we will need info from the package.json and
// Procfile files in the folder this command was called from.
if (ops.args[0] !== 'list') {
	var info = tfmonitor.procfile.getCommand(ops.args[1]);
	if (!info) {
		console.log('Make sure you have Procfile and package.json files.');
		return;
	} else {
		appName = info.appName;
		cmdName = info.cmdName;
		cmdVal = info.cmdVal;
	}
}

/*	The following is the core implimentation of all the commands available
	in TF Monitor.
*/
if (ops.args[0] === 'start') {
	// Start spawns a whole new process, because we need it to run in a background
	// process and not tie up the console.
	var out = fs.openSync(ops.log ? 'tfmonitor.log' : '/dev/null', 'a');
	var err = fs.openSync(ops.log ? 'tfmonitor.err' : '/dev/null', 'a');
	if (ops.foreground) {
		var child = childProcess.spawn(__dirname+'/start.js', [cmdName]);
	} else {
		var child = childProcess.spawn(
			__dirname+'/start.js', [cmdName],
			{ detached: true, stdio: [ 'ignore', out, err ]  }
		);
		child.unref();
	}
} else if (ops.args[0] === 'register') {
	tfmonitor.daemon.addDaemon(
		'cd '+process.cwd().replace(' ', '\\ ')+'; '+cmdVal+' #'+appName+':'+cmdName+'#',
		function() {
			console.log('Registered "'+cmdName+'" in app "'+appName+'".');
			console.log('App will start on boot-up.');
		}
	);
} else if (ops.args[0] === 'unregister') {
	tfmonitor.daemon.removeDaemon('#'+appName+':'+cmdName+'#', function(err, removed) {
		if (err) {
			throw err;
		} else if (!removed) {
			console.log('Couldn\'t find anything to unregister.');
		} else {
			console.log('Unregistered "'+cmdName+'" in app "'+appName+'".');
			console.log('App won\'t start on boot-up anymore.');
		}
	});
} else {
	console.log('Error: "'+ops.args[0]+'" not found. Remember, this utility is a WIP.');
}
