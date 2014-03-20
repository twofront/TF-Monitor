/*	Makes a command run on boot-up. Currently this is always
	done using an @reboot cron. This could be changed to use
	platform prefered systems, like launchd on Mac OS, upstart
	on Ubuntu, init.d on some other linux operating systems and
	so on. I don't know of any advantage these give over a cron,
	and from my experience cron is available almost universally.
	If there is an advantage to using the other systems feel free
	to let me know or impliment them in a fork.
*/

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

/*	## addDaemon Function
	@param runcmd The command to run when the computer starts.
	@param callback The function to call once the daemon is setup.
*/
module.exports.addDaemon = function(runcmd, callback) {
	// Get the contents of the current crontab for this user.
	getCron(function(stdout) {
		// Check if the last line is blank and if so don't do a \n before inserting the new command.
		// This just avoids an ugly crontab with too many blank lines.
		var s = stdout.split('\n');
		if (s[s.length-1] !== '') stdout += '\n';
		// Append our command to the rest of the commands in your crontab.
		stdout += '@reboot '+runcmd+'\n';
		writeCron(stdout, callback);
	}, callback);
};

/*	## removeDaemon Function
	@param pattern All or part of the command that should no longer run on boot.
	@param callback The function to call once the daemon is removed.
*/
module.exports.removeDaemon = function(pattern, callback) {
	getCron(function(stdout) {
		var s = stdout.split('\n');
		var madeChange = false;
		for (var i=0; i<s.length; i++) {
			var l = s[i];
			if (l.match(pattern)) {
				s.splice(i, 1);
				madeChange = true;
				// Since we removed an element from the array we don't increment next time through
				// the loop.
				i--;
			}
		}
		if (madeChange) {
			var stdout = s.join('\n');
			writeCron(stdout, callback);
		} else {
			// No lines were found that match the pattern...
			callback(null, false);
		}
	}, callback);
};
