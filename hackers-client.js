/*
 * hackers-client.js
 *
 * https://github.com/robinouu/hackers
 *
 * Copyright (c) 2010-2012 Robin Ruaux
 * Licensed under the new BSD license.
 */
var util = require("util"),
	color = require('colors'),
	crypto = require('crypto'),
	CLI = require("./lib/CLI.js"),
	wormhole = require("wormhole"),
	RemoteConnector = require("./lib/RemoteConnector.js"),
	pack = require("./package.json");

// Create a CLI
var cli = new CLI;
var connector = new RemoteConnector;
var username = '';

connector.on('connected', function ()
{
	cli.unregisterCommand('connect');
	cli.registerCommand(cmdDisconnect);
	
	wormhole(connector.socket, 'auth', function (data)
	{
		if (data.action === 'login')
		{
			util.log("You need to login to access your character.");
			cli.question('  LOGIN : ', function (login)
			{
				cli.question('  PASSWORD : ', function (pass)
				{
					var sha1 = crypto.createHash('sha1');
					sha1.update(pass);
					
					username = login;
					
					connector.send('auth', { action: 'login', user : login, pass: sha1.digest('hex')});
					cli.prompt();
				});
			});	
        }
	});
	
	/* RPC client , redirect commands result to remote channels */
	wormhole(connector.socket, 'rpc', function (data)
	{
		if (data.action === 'register' && typeof data.cmds === 'object')
		{
			cli.browseCmds(data.cmds, function(c)
			{
				c.callback = function (data)
				{
					data.action = (c.name) ? c.name : c.cmdGroup;
					data.sender = username;
					connector.send(c.channel, data);
				};
				
			}, true);
			
			cli.registerCommands(data.cmds);
		}
	});
	
	wormhole(connector.socket, 'chat', function (data)
	{
		if (typeof data.sender === 'string' && typeof data.msg === 'string')
			util.log('[' + 'chat'.bold.green + '][' + ((data.sender === username) ? data.sender.bold.grey : data.sender.bold.yellow) + '] ' + data.msg.substring(0, 250));
	});
});

connector.on('disconnected', function (err)
{
	if (err)
		util.debug('Disconnected from the server : ' + err);
	else
		util.log('Disconnected from the server.');
		
	cli.cmds = [];
	cli.registerCommands([cmdConnect, cmdHelp, cmdExit]);
});

/* Register commands */
var cmdConnect = {
	cmd: 'connect *(?<port>[0-9]+)?',
	help: ("connect " + "<port>".cyan).bold + "\tStart the client on the specified port (4000 by default).",
	callback: function(data)
	{
		var p = data.port ? data.port : 4000;
		util.log('Connecting to port ' + p);

		connector.connect('localhost', p);
	},
};

var cmdDisconnect = {
	cmd: "disconnect",
	help: ("disconnect").bold + "\t\tForce disconnection from the server.",
	callback: function(data)
	{
		connector.disconnect();
	}
};

var cmdHelp = {
	cmd: "help *(?<cmd>[a-zA-Z0-9\-\_\.]+)?",
	help: ("help " + "<cmd>".cyan).bold + "\t\tGet the help for all or specified commands.",
	callback: function(data)
	{
		util.log(cli.usage(data.cmd));
	}
};

var cmdExit = {
	cmd: "exit",
	help: ("exit").bold + "\t\t\tQuit the program (same as Ctrl+C)",
	callback: function(data)
	{
		cli.rl.close();
	}
}

cli.registerCommands([cmdConnect, cmdHelp, cmdExit]);

cli.rl.on('close', function()
{
	util.log("Program is exiting...");
	
	process.exit(0);
	process.stdin.destroy();
});

cli.prompt();
