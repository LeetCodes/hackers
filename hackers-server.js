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
	color = require("colors"),
	wormhole = require("wormhole"),
	Server = require("./lib/Server.js"),
	CLI = require("./lib/CLI.js");
	
var pack = require("./package.json");

/* Create the database connection */
var Db = require('mongodb').Db,
	DbServer = require('mongodb').Server;

var dbclient = new Db('hackers', new DbServer("127.0.0.1", 27017, {}));

// Create a CLI
var cli = new CLI();

// Create the server
var server = new Server();
var port = 4000;

/* Register commands */
var cmdStart =
{
	cmd: 'start *(?<port>[0-9]+)?',
	help: ("start " + "<port>".cyan).bold + "\tStarts the server on the specified port.",
	callback: function(data)
	{
		port = data.port ? data.port : port;
		server.start(port);
	}
};

var cmdStop = 
{
	cmd: "stop",
	help: ("stop").bold + "\t\tStops the server. It will disconnect all sockets from the port.",
	callback: function(data)
	{
		server.stop();
	}
};

var cmdClients =
{
	cmd: "clients",
	help: ("clients").bold + "\tGets the number of connected clients.",
	callback: function()
	{
		util.log(server.clients.length ? server.clients.length.toString().bold.green + ' clients connected' : 'no client connected');
	}
};

var cmdUsers =
{
	cmdGroup: "users",
	help: ("users").bold + "\t\tManages game users from the server.",
	children: [
	{
		cmd: "users *add *\"(?<username>[a-zA-Z0-9\ ]+)\" \"(?<password>[a-zA-Z0-9\ ]+)\"",
		help: ("users " + "add".cyan).bold + "\t<username> <password>\tAdd a unique user to the database",
		callback: function(data)
		{
			var sha1 = crypto.createHash('sha1');
			sha1.update(data.password);
			
			var users = dbclient.collection('users');
			data.password = sha1.digest('hex');
			util.log('Add user "' + data.username.yellow.bold  + '" to the database...');
			
			users.findOne({user: data.username}, function (err, doc)
			{
				if (doc)
				{
					util.debug('[' + 'mongodb'.bold.red + '] Could not add "' + data.username.yellow.bold + '" because the name is reserved by another user.');
				}
				else
				{
					users.insert({user: data.username, pass : data.password}, function (err)
					{
						if (err)
							util.debug('[' + 'mongodb'.bold.red + '] ' + err);
						else
							util.log('Done.');
					});
				}
			});				
		}
	},
	{
		cmd: "users *remove *\"(?<username>[a-zA-Z0-9\ ]+)\"",
		help: (("users " + "remove".cyan).bold) + "\t<username> \t\tRemoves a user from to the database",
		callback: function(data)
		{
			var users = dbclient.collection('users');
			util.log('Removing user "' + data.username.yellow.bold  + '" from the database...');
			
			users.remove({user: data.username}, function (err, res)
			{
				if (err)
					util.debug('[' + 'mongodb'.bold.red + '] ' + err);
				else if (!res)
					util.debug('[' + 'mongodb'.bold.red + '] Could not find "' + data.username.yellow.bold + '" username in the database.');
				else
					util.log('Done.');
			});
		}
	}]
};

var cmdHelp =
{
	cmd: "help *(?<cmd>[a-zA-Z0-9\-\_\.]+)?",
	help: ("help " + "<cmd>".cyan).bold + "\tGets the help for all or specified commands.",
	callback: function(data)
	{
		util.log(cli.usage(data.cmd));
	}
};

var cmdExit =
{
	cmd: "exit",
	help: ("exit").bold + "\t\tQuit the program (same as Ctrl+C)",
	callback: function(data)
	{
		cli.rl.close();
	}
};

cli.rl.on('close', function()
{
	util.log("Exiting server...");
	
	dbclient.close();

	process.exit(0);
	process.stdin.destroy();
});

server.on('clientConnected', function (client)
{
	console.log("A client has connected (" + client.stream.remoteAddress.bold.green + ").");
	
	var stream = client.stream;
	
	wormhole(stream, 'auth', function (data)
	{
		var res = dbclient.collection('users').findOne({user: data.user, pass: data.pass}, function(err, document)
		{
			if (document)
			{
				client.name = data.user;
				util.log(client.name.bold.yellow + ' signs in.');
				stream.write('chat', {sender: 'server'.green, msg: utils.EscClearScreen + 'Thank you for logging in ! Type ' + 'help'.bold + ' to get a list of commands you can use on.'});
				stream.write('rpc', {action: 'register', cmds : [{
					name: 'say',
					cmd: 'say (?<msg>.+)?',
					help: ("say " + "<msg>".cyan).bold + "\tSends your message to the public chat ",
					channel : 'chat'
				}]});
			}
			else
			{
				stream.write('chat', {sender: 'server'.red, msg: 'Bad identifiers'});
				stream.write('auth', {action: 'login'});
			}
		});
	});
	
	wormhole(stream, 'chat', function (data)
	{
		if (data.action === 'say' && typeof data.sender === 'string')
		{
			safeData = {action: 'say', sender: data.sender, msg: data.msg.substring(0, 250)};
			server.broadcast('chat', safeData);
			util.log('[' + "chat".bold.green + '][' + safeData.sender.bold.yellow + '] ' + safeData.msg);
		}
	});

	stream.write('chat', {sender: 'server'.green, msg: utils.EscClearScreen + 'Welcome to the ' + 'HaCker$'.bold.cyan + ' server !'});
	stream.write('auth', {action: 'login'});
});

server.on('clientDisconnected', function(client)
{
	util.log((client.name) ? client.name.bold.yellow + " signs out." : "A client has disconnected.");
});

server.on('started', function(p)
{
	util.log("Server started on port " + p.toString().bold.green);
	cli.prompt();
	
	cli.unregisterCommand('start');
	cli.registerCommands([cmdClients, cmdStop]);
});

server.on('stopped', function()
{
	console.log("Server stopped.");
	cli.prompt();
	
	cli.cmds = [];
	cli.registerCommands([cmdStart, cmdUsers, cmdHelp, cmdExit]);
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
	
	cli.registerCommands([cmdStart, cmdUsers, cmdHelp, cmdExit]);
	cli.prompt();	
});
