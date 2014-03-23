
var childProcess = require('child_process');
var fs = require('fs');

function getCron(callback, failed) {
	childProcess.exec('crontab -l', function (err, stdout, stderr) {
		if (err) {
			failed(err);
			return;
		}
		if (stderr) {
			failed(new Error('Crons not available.'));
			return;
		}
		callback(stdout);
	});
}

function writeCron(contents, callback) {
	// Write the new crontab to a temporary file, tell cron to use the contents, then delete
	// the temporary file.
	fs.writeFile('cron.tmp', contents, function() {
		childProcess.exec('crontab cron.tmp', function() {
			fs.unlink('cron.tmp', function() {
				callback(null, true);
			});
		});
	});
}

module.exports.addDaemon = function(name, command, callback) {
	var cmdStr = '';
	for (var i=0; i<command.length; i++) {
		cmdStr += command[i].replace(' ', '\\ ') + ' ';
	}

	getCron(function(stdout) {
		// Check if the last line is blank and if so don't do a \n before inserting the new command.
		// This just avoids an ugly crontab with too many blank lines.
		var s = stdout.split('\n');
		if (s[s.length-1] !== '') stdout += '\n';
		// Append our command to the rest of the commands in your crontab.
		stdout += '@reboot '+cmdStr+'#'+name+'#'+'\n';
		writeCron(stdout, callback);
	}, callback);
};

module.exports.removeDaemon = function(name, callback) {
	getCron(function(stdout) {
		var s = stdout.split('\n');
		var madeChange = false;
		for (var i=0; i<s.length; i++) {
			var l = s[i];
			if (l.match('#'+name+'#')) {
				s.splice(i, 1);
				madeChange = true;
				// Since we removed an element from the array we don't increment next time through
				// the loop.
				i--;
			}
		}
		if (madeChange) {
			stdout = s.join('\n');
			writeCron(stdout, callback);
		} else {
			// No lines were found that match the pattern...
			callback(null, false);
		}
	}, callback);
};
