# Contributing To TF Monitor

## Coding Conventions

A JSHint configuration is present in our `config.json` file. I personally use the JSHint plugin for Sublime Text.

## Setup

After downloading the repository using GIT we recommend you do the following commands in the project folder:

	npm install
	sudo npm link

The first command creates a `node_modules` folder with our dependencies. The second adds a globally-installed symbolic link to your system for the command `tfmonitor`.

## Current Approaches

The following outlines how all the functionality is implimented in general terms. I'm not sure what the best way necessarily is, so if you read through this section and disagree with something let me know!

### Start/Stop Commands

We launch a special process which then monitors your program all using Node's "child_process" module. For each call to "start" we add a pid to the file "/tmp/tfmonitor.json". Then, a call to stop finds the pid using that file and runs the command line command "kill [pid]".

### Add/Remove From Boot

We add/remove lines from your crontab and use the @reboot keyword. I know, there's generally a system specific way to start daemons on boot, however cron seems to be much more cross-platform to me.
