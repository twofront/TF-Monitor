/*	Makes a command run on boot-up. Currently this is done using an
	@reboot cron for linux and launchd on Mac OS. This could be
	changed to use upstart on Ubuntu, init.d on other linux operating
	systems.
*/

if (process.platform === 'darwin') {
	// Mac OS uses launchd.
	module.exports = require('./launchd.js');
} else {
	// Linux uses cron (init.d in the future).
	module.exports = require('./cron.js');
}
