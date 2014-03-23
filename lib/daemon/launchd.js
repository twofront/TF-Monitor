
var fs = require('fs');

module.exports.addDaemon = function(name, command, callback) {
	var c = [];
	c.push('<?xml version="1.0" encoding="UTF-8"?>');
	c.push('<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">');
	c.push('<plist version="1.0">');
	c.push('<dict>');
	c.push('  <key>Label</key>');
	c.push('  <string>com.twofront.tfmonitor.'+name+'</string>');
	c.push('  <key>ProgramArguments</key>');
	c.push('  <array>');
	for (var i=0; i<command.length; i++) {
		c.push('    <string>'+command[i]+'</string>');
	}
	c.push('  </array>');
	c.push('  <key>RunAtLoad</key>');
	c.push('  <true/>');
	c.push('  <key>WorkingDirectory</key>');
    c.push('  <string>'+process.cwd()+'</string>');
	c.push('</dict>');
	c.push('</plist>');
	fs.writeFile('/Library/LaunchDaemons/com.twofront.tfmonitor.'+name+'.plist', c.join('\n'), function(err) {
		if (err) {
			console.log('Can\'t write to "/Library/LaunchDaemons/". Try using sudo.');
		} else {
			callback();
		}
	});
};

module.exports.removeDaemon = function(name, callback) {
	fs.unlink('/Library/LaunchDaemons/com.twofront.tfmonitor.'+name+'.plist', function(err) {
		if (err) {
			callback(err);
		} else {
			callback(null, true);
		}
	});
};
