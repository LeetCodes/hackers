#!/usr/bin/env node

/*
 * hackers-server.js
 *
 * https://github.com/robinouu/hackers
 *
 * Copyright (c) 2010-2012 Robin Ruaux
 * Licensed under the new BSD license.
 */

var util = require('util'),
	color = require("colors"),
	
	Server = require("./lib/Server.js"),
	CLI = require("./lib/CLI.js");
	
var pack = require("./package.json");


// Create the server
var server = new Server();
var port = 8081;
server.on('clientConnected', function(client)
{
	console.log(client.stream.remoteAddress.bold.green + ' client connected.');
	
	// Write in the hall channel of the client a welcome message
	client.stream.write('hall',
	{
		id : 'welcome',
		msg : "Welcome to the " + "HACKERS SERVER".cyan.bold + " (" + pack.version + ")\n\nType " + "[help]".bold.green + " for available commands"
	});
});

server.on('started', function(p)
{
	util.log("Server started on port " + p.toString().bold.green);
	cli.prompt();
});

server.on('stopped', function()
{
	console.log("Server stopped.");
	cli.prompt();
});

// Create a CLI
var cli = new CLI();

/* Register commands */
cli.registerCommands([
{
	cmd: 'start *(?<port>[0-9]+)?',
	callback: function(data)
	{
		port = data.port ? data.port : port;
		server.start(port);
	},
},
{
	cmd: "stop",
	callback: function(data)
	{
		server.stop();
	}
},
{
	cmd: "clients",
	callback: function()
	{
		util.log(server.clients.length ? server.clients.length.toString().bold.green + ' clients connected' : 'no client connected');
	}
},
{
	cmd: "help",
	callback: function(data)
	{
		util.log('\nUsage:\n' + cli.usage());
	}
},
{
	cmd: "exit",
	callback: function(data)
	{
		cli.readline.close();
	}
}]);

cli.readline.on('close', function()
{
	util.log("Program is exiting...");
	
	process.exit(0);
	process.stdin.destroy();
});

/* Process error handler */
process.on('uncaughtException', function(e)
{
	/* if port is already in use, we retry every X milliseconds */
	if (e.code == 'EADDRINUSE')
	{	
		setTimeout(function ()
		{
			console.log('Address in use, retrying...');
			server.start(port);
		}, 1000);
	}
	else
	{
		util.debug(e.toString().bold.red);
		cli.prompt();
	}
});

cli.prompt();
