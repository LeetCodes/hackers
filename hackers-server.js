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
	optimist = require('optimist'),
	
	Server = require("./lib/Server.js"),
	Command = require("./lib/Command.js"),
	CLI = require("./lib/CLI.js");
	
var pack = require("./package.json");

/* Program variables */
var argv = optimist.usage(('MUD server - CLI version ' + pack.version).green,
{
  'port': {
    description: 'the port to listen for sockets connections'.cyan.bold,
    short: 'p',
	default: 8081
  },
  'retryInterval': {
    description: 'the number of milliseconds before restarting a connection'.cyan.bold,
    short: 'r',
	default: 2000
  },
  'help': {
	description: 'show usages of the CLI server tool'.cyan.bold,
	short: 'h'
  }
}).argv;

util.log(optimist.help().toString().bold);


// Create the server
var server = new Server();

server.on('clientConnected', function(client)
{
	console.log(client.stream.remoteAddress.bold.green + ' client connected.');
	
	// Write in the hall channel of the client a welcome message
	client.stream.write('hall',
	{
		id : 'welcome',
		msg : "Welcome to the " + "HACKERS SERVER".cyan.bold + " (" + program.version() + ")\n\nType " + "[help]".bold.green + " for available commands"
	});
});

server.on('started', function(port)
{
	console.log("Server started on port " + port.toString().bold.green);
	cli.getCommand();
});

server.on('stopped', function()
{
	console.log("Server stopped.");
	cli.getCommand();
});

// Create a CLI
var cli = new CLI();

var cmdStart = new Command("start <port>", "start the server on the specified port", '^start([" "](?<port> [0-9]+))?', function (data)
{
	server.start(parseInt(data.port) || argv.port);
});

var cmdStop = new Command("stop", "stop the server", '^stop', function ()
{
	server.stop();
});

var cmdClients = new Command("clients", "get the number of clients sockets currently connected", '^clients', function ()
{
	util.log(server.clients.length.toString().bold.green + ' clients connected');
});

var cmdHelp = new Command("help", "display the commands usage", '^help', function ()
{
	util.log('\nUsage:\n' + cli.usage());
});

var cmdExit = new Command("exit", "exit the server program", '^exit', function ()
{
	util.log("Program exiting...");
	process.exit(0);
});

/* Register commands */
cli.register([cmdStart, cmdStop, cmdClients, cmdHelp, cmdExit]);

/* Process error handler */
process.on('uncaughtException', function(e)
{
	/* if port is already in use, we retry every X milliseconds */
	if (e.code == 'EADDRINUSE')
	{	
		setTimeout(function ()
		{
			console.log('Address in use, retrying...');
			server.start(argv.port);
		}, argv.retryInterval);
	}
	else
	{
		util.debug(e.toString().bold.red);
		cli.getCommand();
	}
});
cli.getCommand();
