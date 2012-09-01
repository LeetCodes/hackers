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
	fs = require("fs"),
	net = require('net'),
	wormhole = require("wormhole"),
	CLI = require("./lib/CLI.js"),
	pack = require("./package.json");

/* Program variables */


// Create a CLI
var cli = new CLI();
var client;

/* Register commands */
cli.registerCommands([
{
	cmd: 'connect *(?<port>[0-9]+)?',
	help: ("connect " + "<port>".cyan).bold + "\tStart the server on the specified port.",
	callback: function(data)
	{
		var p = data.port ? data.port : 8081;
		util.log('Connecting to port ' + p);

		client = net.connect(p, 'localhost', function()
		{
			util.log('Connected !');
			
			wormhole(client, 'hall', function (data)
			{
				if (typeof data.msg !== 'undefined')
					util.log(data.msg);
			});
		});
	},
},
{
	cmd: "disconnect",
	help: ("disconnect").bold + "\t\tForce disconnection from the server.",
	callback: function(data)
	{
		util.log(cli.usage(data.cmd));
	}
},
{
	cmd: "help *(?<cmd>[a-zA-Z0-9\-\_\.]+)?",
	help: ("help " + "<cmd>".cyan).bold + "\t\tGet the help for all or specified commands.",
	callback: function(data)
	{
		util.log(cli.usage(data.cmd));
	}
},
{
	cmd: "exit",
	help: ("exit").bold + "\t\t\tQuit the program (same as Ctrl+C)",
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

cli.prompt();
