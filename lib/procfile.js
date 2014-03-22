/*	# Procfile Module
	This allows you to read the contents of a procfile. Use it to find
	a command based on a known name.
*/

var fs = require('fs');

/*	## getCommand
	@param wantedCmd The name of the command you want.
	@param location (optional) The path of the procfile. If not specified we assume it's
		named "Procfile" and located in the folder you executed the node app in.
*/
module.exports.getCommand = function(wantedCmd, location) {
	var returnVal = {};

	// Get the appName from package.json.
	try {
		var appName = fs.readFileSync('./package.json');
		returnVal.appName = JSON.parse(appName).name;
	} catch(e) {
		return null;
	}

	// Get the cmdName from Procfile.
	try {
		var procfile = fs.readFileSync(location ? location : './Procfile').toString();
		var lines = procfile.split('\n');
		for (var i=0; i<lines.length; i++) {
			// Here we use replace to get the various parts of our regex
			// (not to actually replace anything)
			lines[i].replace(/([a-zA-Z0-9_]*):[\s\t]*(.*)/, function(all, name, cmd) {
				if (name === wantedCmd) {
					// We found the command in our Procfile!
					returnVal.cmdName = name;
					returnVal.cmdVal = cmd;
				}
			});
		}
		if (returnVal.cmdName === null || returnVal.cmdVal === null) {
			return null;
		}
	} catch(e) {
		return null;
	}

	return returnVal;
}
