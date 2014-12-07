# TF Monitor (Work in Progress)

**Note:** TF Monitor, at this point, isn't being written with Windows in mind. Only Linux and Mac OS. Also, we expect your system to have git, cron and node installed in the default locations.

TF Monitor automatically restarts node applications when they crash or any file in their directory changes. In the future you will be able to:

- specify an application to launch on bootup
- automatically update and restart your app whenever you push to GIT

## Install

`npm install -g tfmonitor`

Use `sudo` if necessary.

## Usage

TF Monitor uses a file called `Procfile` placed in your project folder to launch your application. This file should contain one or more lines that:

- start with a name followed by a colon
- after the colon is the command to start your application

See the "Launch Application" section for example.

A `package.json` file with a valid `name` is also required.

### Launch Application

Run the following from your applications root folder:

`tfmonitor start web`

Or, if you want to run tfmonitor in the foreground so you can use ctrl-c to stop it use:

`tfmonitor start web --foreground`

You may also enable logging for this command with the `--log` command line parameter. This is useful if you want to know when your application restarts or you want to see any errors thrown by TF Monitor (the software is still early in development, so don't rely on it in a production environment).

Your `Procfile` for this example should look like:

`web: node myapp.js`

### Stop Application

`tfmonitor stop web`

Where web is the command name in your `Procfile`.

### Start Application On Boot

`tfmonitor register web`

Note that your application will start on boot without using tfmonitor for restarting... This will change soon.

### Remove Application From Boot

`tfmonitor unregister web`

### Show Running Applications

`tfmonitor list`

This will return a list of **running** applications each with a pid and name. Note that the pid is for the tfmonitor process that is monitoring your appliction and not your application itself. If you kill this process it will not automatically restart like your application will.

### Setup GIT

First, make sure your application is fully setup to work with GIT. Try a `git pull` from your apps root directory.

Once this is working simply add `-git` to your `start` or `register` command like so:

`tfmonitor register web -git`

This will do a `git pull` once per hour. The advantage of this is your computer can be behind a firewall with no exposed ports. 

## Unimplemented Features

**The following features are not yet implemented. This defines how we plan to make them work in the future!**

### Setup GIT Hook

If your computer is not behind a firewall, or you have the ability to open ports, the better way to setup git is to use a "hook". Your hook should point to:

http://YourIPOrURL:OpenPort/update

Then use our `-githook [port]` command like in the following example:

`tfmonitor register web -githook 8989`

Note that tfmonitor will run a small web service on your chosen port and that the application tfmonitor runs cannot use the same port.
