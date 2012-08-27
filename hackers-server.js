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
	Command = require("./lib/Command.js"),
	CLI = require("./lib/CLI.js");
	
var pack = require("./package.json");

/* Program variables */
program
	.version(pack.version)
	.option('-p, --port <port>', 'the port to listen for sockets connections', parseInt)
	.option('-r, --retryInterval <milliseconds>', 'The number of milliseconds before restarting connection when an error occurs', parseInt)
	.parse(process.argv);
  
if (typeof program.port !== 'number' || program.port < 0)
	program.port = 8081;
if (typeof program.retryInterval !== 'number' || program.retryInterval < 0)
	program.retryInterval = 2000;	

/* Create the server */
var server = new Server();

server.on('clientConnected', function(client)
{
	util.log(client.stream.remoteAddress.bold.green + ' client connected.');
	
	/* Write in the hall channel of the client a welcome message */
	client.stream.write('hall',
	{
		id : 'welcome',
		msg : "Welcome to the " + "HACKERS SERVER".cyan.bold + " (" + program.version() + ")\n\nType " + "[help]".bold.green + " for available commands"
	});
});

server.on('started', function(port)
{
	util.log("Server started on port " + port.toString().bold.green);
	cli.prompt();
});

server.on('stopped', function()
{
	util.log("Server stopped.");
	cli.prompt();
});

/* Create a CLI */
var cli = new CLI();

var cmdStart = new Command('^start([" "](?<port> [0-9]+))?', "start the server on the specified port", function (data)
{
	server.start(parseInt(data.port) || program.port);
});

var cmdStop = new Command("^stop", "stop the server", function ()
{
	server.stop();
});

var cmdClients = new Command("clients", "get the number of clients sockets currently connected", function ()
{
	util.log(server.clients.length.toString().bold.green + ' clients connected');
});

var cmdExit = new Command("^exit", "exit the server program", function ()
{
	util.log("Program exiting...");
	process.exit(0);
});
/* Register commands */
cli.register([cmdStart, cmdStop, cmdClients, cmdExit]);

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
		util.debug(e.toString().bold.red);
		cli.prompt();
	}
});


cli.prompt();