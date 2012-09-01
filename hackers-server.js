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
	utils = require('./lib/Utils.js'),
	color = require("colors"),
	wormhole = require("wormhole"),
	Server = require("./lib/Server.js"),
	CLI = require("./lib/CLI.js");
	
var pack = require("./package.json");

/* Create the database connection */
var Db = require('mongodb').Db,
	DbServer = require('mongodb').Server;

var dbclient = new Db('hackers', new DbServer("127.0.0.1", 27017, {}));

// Create the server
var server = new Server();
var port = 4000;

server.on('clientConnected', function (client)
{
	console.log("A client has connected (" + client.stream.remoteAddress.bold.green + ").");
	
	var stream = client.stream;
	wormhole(stream, 'auth', function (data)
	{
		util.log('A client request for login : ');
		util.log(util.inspect(data));
		
		var res = dbclient.collection('users').findOne({user: data.user, pass: data.pass}, function(err, document)
		{
			if (document)
			{
				client.name = data.user;
				util.log(client.name + ' sign in.');
				stream.write('chat', {sender: 'server'.green, msg: utils.EscClearScreen + 'Thank you for logging in ! Type ' + 'help'.bold + ' to get a list of commands you can use on.'});
			}
			else
			{
				stream.write('chat', {sender: 'server'.red, msg: 'Bad identifiers'});
			}
		});
	});

	stream.write('chat', {sender: 'server'.green, msg: utils.EscClearScreen + 'Welcome to the ' + 'HaCker$'.bold.cyan + ' server !'});
	stream.write('auth', {action: 'login'});
});

server.on('clientDisconnected', function(client)
{
	util.log((client.name) ? client.name + " sign out." : "A client has disconnected.");
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
	help: ("start " + "<port>".cyan).bold + "\tStart the server on the specified port.",
	callback: function(data)
	{
		port = data.port ? data.port : port;
		server.start(port);
	},
},
{
	cmd: "stop",
	help: ("stop").bold + "\t\tStop the server. It will disconnect all sockets from the port.",
	callback: function(data)
	{
		server.stop();
	}
},
{
	cmd: "clients",
	help: ("clients").bold + "\tGet the number of connected clients.",
	callback: function()
	{
		util.log(server.clients.length ? server.clients.length.toString().bold.green + ' clients connected' : 'no client connected');
	}
},
{
	cmd: "users *add *\"(?<username>[a-zA-Z0-9\ ]+)\" \"(?<password>[a-zA-Z0-9\ ]+)\"",
	help: ("users add <username> <password>").bold + "\tAdd a user to the game",
	callback: function(data)
	{
		util.log('Add user ' + data.username  + ' with password ' + data.password + '...');
		dbclient.collection('users').insert({user: data.username, pass : data.password});
	}
},
{
	cmd: "help *(?<cmd>[a-zA-Z0-9\-\_\.]+)?",
	help: ("help " + "<cmd>".cyan).bold + "\tGet the help for all or specified commands.",
	callback: function(data)
	{
		util.log(cli.usage(data.cmd));
	}
},
{
	cmd: "exit",
	help: ("exit").bold + "\t\tQuit the program (same as Ctrl+C)",
	callback: function(data)
	{
		cli.rl.close();
	}
}]);

cli.rl.on('close', function()
{
	util.log("Exiting server...");
	
	dbclient.close();

	process.exit(0);
	process.stdin.destroy();
});

/* Process error handler */
process.on('uncaughtException', function(e)
{
	/* if port is already in use, we retry every second */
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

// When connected to the MongoDB database
dbclient.open(function(err, p_client)
{
	if (err)
	{
		util.debug('[' + 'mongodb'.bold.red + '] ' + err.toString());
		return false;
	}

	cli.prompt();	
});
