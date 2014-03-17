# TF Monitor (Work in Progress)

**Note that everything below is a specification for our implimentation at this point and very little is actually implimented!**

TF Monitor automatically restarts node applications when they crash or any file in their directory changes. Additionally, you can:

- specify an application to launch on bootup
- automatically update and restart your app whenever you push to GIT

## Install

`npm install -g tfmonitor`

Use `sudo` if necessary.

## Usage

TF Monitor uses a file called `Procfile` placed in your project folder to launch your application. This file should contain one or more lines that:

- start with a name followed by a colon
- after the colon is the command to start your application

Also note that a package.json with your applications name is also required.

### Launch Application

Run the following from your applications root folder:

`tfmonitor start web`

Your `Procfile` for this example should look like:

`web: node myapp.js`

### Start Application On Boot

`tfmonitor register web`

Note that this will also start your application immediately in the background.

### Show Running and Registered Applications

`tfmonitor list`

This will return a list of **running** applications and **registered** applications each with an id. If an application is running and registered to start on boot it will be listed in both lists. Make sure you use the correct id in the `unregister` and `stop` commands.

### Stop Application

`tfmonitor stop 123`

Where 123 is the **running** id returned by `tfmonitor list`.

### Remove Application From Boot

`tfmonitor unregister web 123`

### Setup GIT

First, make sure your application is fully setup to work with GIT. Try a `git pull` from your apps root directory.

Once this is working simply add `-git` to your `start` or `register` command like so:

`tfmonitor register web -git`

This will do a `git pull` once per hour. The advantage of this is you computer can be behind a firewall without any exposed ports. If this is not an issue, the better way to setup git is to use a "hook". Your hook should point to:

http://YourIPOrURL:OpenPort/update

Then use our `-githook [port]` command like in the following example:

`tfmonitor register web -githook 8989`

Note that tfmonitor will run a small web service on your chosen port and that the application tfmonitor runs cannot use the same port.
