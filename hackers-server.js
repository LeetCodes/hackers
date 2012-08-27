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
	program = require("commander"),	
	
	Server = require("./lib/Server.js"),
	CommandList = require("./lib/CommandList.js"),
	Command = require("./lib/Command.js");

/* Program variables */
program
	.version('0.0.1')
	.option('-p, --port <port>', 'The port to listen for sockets connections.', parseInt)
	.option('-r, --retryInterval <milliseconds>', 'The number of milliseconds before restarting connexion when an error occurs.', parseInt)
	.parse(process.argv);
  
if (typeof program.port !== 'number' || program.port < 0)
	program.port = 8081;
if (typeof program.retryInterval !== 'number' || program.retryInterval < 0)
	program.retryInterval = 2000;	

/* Create the server */
var server = new Server();

server.on('clientConnected', function(client)
{
	util.log('New client connected (' + client.stream.remoteAddress + ')');
	
	/* Write in the hall channel of the client a welcome message */
	client.stream.write('hall',
	{
		id : 'welcome',
		msg : "Welcome to the " + "HACKERS SERVER".cyan.bold + " (" + program.version() + ")\n\nType " + "[help]".bold.green + " for available commands"
	});
});

server.on('started', function()
{
	util.log("Server started on port " + program.port.toString().bold.green);
	cmdList.prompt();
});

server.on('stopped', function()
{
	util.log("Server stopped.");
	cmdList.prompt();
});

/* Create a CLI */
var cmdList = new CommandList();
var cmdStart = new Command("start", /^start$/, function ()
{
	server.start(program.port);
});

var cmdStop = new Command("stop", /^stop$/, function ()
{
	server.stop();
});

/* Register commands */
cmdList.register(cmdStart);
cmdList.register(cmdStop);

/* Process error handler */
process.on('uncaughtException', function(e)
{
	/* if port is already in use, we retry every X milliseconds */
	if (e.code == 'EADDRINUSE')
	{	
		setTimeout(function ()
		{
			console.log('Address in use, retrying...');
			server.start(program.port);
		}, program.retryInterval);
	}
	else
	{
		util.debug(e);
		cmdList.prompt();
	}
});


cmdList.prompt();