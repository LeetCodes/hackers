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
	crypto = require('crypto'),
	wormhole = require("wormhole"),
	Server = require("./lib/Server.js"),
	Room = require("./lib/Room.js"),
	CLI = require("./lib/CLI.js");
	
var pack = require("./package.json");


/* Initialize the mongodb driver */
var Db = require('mongodb').Db,
	DbServer = require('mongodb').Server;
	
var dbclient = new Db('hackers', new DbServer("127.0.0.1", 27017, {}));
dbclient.open(function(err, p_client)
{
	if (err)
	{
		util.debug('[' + 'mongodb'.error + '] ' + err.toString());
		return false;
	}
	
	cli.cmdList.registerCommands([cmdStart, cmdHelp, cmdExit]);
	cli.prompt();	
});

// Create a CLI
var cli = new CLI();

// Create the server
var server = new Server();
var port = 4000;

/* Register commands */
var cmdStart =
{
	cmd: 'start *(?<port>[0-9]+)?',
	help: ("start " + "<port>".argument).strong + "\tStarts the server on the specified port.",
	callback: function(data)
	{
		port = data.port ? data.port : port;
		server.start(port);
	}
};

var cmdStop = 
{
	cmd: "stop",
	help: ("stop").strong + "\t\tStops the server. It will disconnect all sockets from the port.",
	callback: function(data)
	{
		server.stop();
	}
};

var cmdUsers =
{
	cmdGroup: "users",
	help: ("users").strong + "\t\tGets the number of connected clients.",
	callback: function()
	{
		util.log(server.users.length ? server.users.length.toString().info.strong + ' users connected' : 'no user connected');
	},
	children: [
	{
		name: 'users add',
		cmd: "users *add *\"(?<username>[a-zA-Z0-9\ ]+)\" \"(?<password>[a-zA-Z0-9\ ]+)\"",
		help: "users add ".strong + "<username> <password>".argument.strong + "\tAdd a unique user to the database",
		callback: function(data)
		{
			var sha1 = crypto.createHash('sha1');
			sha1.update(data.password);
			
			var users = dbclient.collection('users');
			data.password = sha1.digest('hex');
			util.log('Add user "' + data.username.toString().player.strong + '" to the database...');
			
			users.findOne({user: data.username}, function (err, doc)
			{
				if (doc)
				{
					util.debug('[' + 'mongodb'.error.strong + '] Could not add "' + data.username.toString().player.strong + '" because the name is reserved by another user.');
				}
				else
				{
					users.insert({user: data.username, pass : data.password}, function (err)
					{
						if (err)
							util.debug('[' + 'mongodb'.error.strong + '] ' + err);
						else
							util.log('Done.');
					});
				}
			});				
		}
	},
	{
		name: 'users remove',
		cmd: "users *remove *\"(?<username>[a-zA-Z0-9\ ]+)\"",
		help: "users remove ".strong + "<username>".argument.strong + "\t\tRemoves a user from to the database",
		callback: function(data)
		{
			var users = dbclient.collection('users');
			util.log('Removing user "' + data.username.toString().player.strong  + '" from the database...');
			
			users.remove({user: data.username}, function (err, res)
			{
				if (err)
					util.debug('[' + 'mongodb'.error.strong + '] ' + err);
				else if (!res)
					util.debug('[' + 'mongodb'.error.strong + '] Could not find "' + data.username.toString().player.strong + '" username in the database.');
				else
					util.log('Done.');
			});
		}
	}]
};

var cmdHelp =
{
	cmd: "help *(?<cmd>[a-zA-Z0-9\-\_\.]+)?",
	help: ("help " + "<cmd>".argument).strong + "\tGets the help for all or specified commands.",
	callback: function(data)
	{
		util.log(cli.cmdList.usage(data.cmd));
	}
};

var cmdExit =
{
	cmd: "exit",
	help: ("exit").strong + "\t\tQuit the program (same as Ctrl+C)",
	callback: function(data)
	{
		cli.close();
	}
};
 
cli.on('close', function()
{
	util.log("Exiting server...");
	
	dbclient.close();

	process.exit(0);
	process.stdin.destroy();
});

var hall = new Room('hall');

server.on('userConnected', function (user)
{
	console.log(user.username.toString().player.bold + " has joined (" + user.stream.remoteAddress.toString().info.bold + ").");
	
	user.gotoRoom(hall);
	user.send(utils.EscClearScreen + 'Welcome to the '.white + 'HaCker$'.info.strong + ' server ! '.white + utils.NewLine + utils.NewLine + 'Type '.white + 'help'.command.strong + ' to get a list of available commands.'.white + utils.NewLine);
});

server.on('userDisconnected', function (user)
{
	console.log(user.username.toString().player.bold + " has left.");
	user = null;
});

server.on('started', function(p)
{
	util.log("Server started on port " + p.toString().bold.green);
	cli.prompt();
	
	cli.cmdList.unregisterCommand('start');
	cli.cmdList.registerCommands([cmdUsers, cmdStop]);
});

server.on('stopped', function()
{
	console.log("Server stopped.");
	cli.prompt();
	
	cli.cmdList.registerCommands([cmdStart, cmdHelp, cmdExit]);
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
	else if (e.code !== 'ECONNABORTED')
	{
		util.debug(e.toString().bold.red);
		cli.prompt();
	}
});
