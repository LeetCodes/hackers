/*
 * hackers-server.js
 *
 * https://github.com/robinouu/hackers
 *
 * Copyright (c) 2010-2012 Robin Ruaux
 * Licensed under the new BSD license.
 */
/*
 * hackers-server.js
 *
 * https://github.com/robinouu/hackers
 *
 * Copyright (c) 2010-2012 Robin Ruaux
 * Licensed under the new BSD license.
 */
var util = require("util"), color = require('colors');
var fs = require("fs"), readline = require("readline"), net = require('net');
var rl = readline.createInterface(process.stdin, process.stdout);
var wormhole = require("wormhole");
var program = require("commander");

program
  .version('0.0.1')
  .option('-p, --port <n>', 'The port to listen for sockets connections', parseInt)
  .parse(process.argv);
  
if (typeof program.port !== 'number' || program.port < 0)
	program.port = 8081;
	
function Client(stream, username)
{
	this.username = (typeof username === 'string') ? username : '';
	this.stream = stream;
}

Array.prototype.remove = function(e)
{
	for (var i = 0; i < this.length; i++)
	{
		if (e == this[i])
			return this.splice(i, 1);
	}
};

var clients = [];

var server = net.createServer({ allowHalfOpen: true}, function (stream)
{
	var client = new Client(stream);
	clients.push(client);

	stream.setEncoding("utf8");

	wormhole(client.stream, 'hall', function (data)
	{
        if (data.id === 'login' && typeof data.username === 'string')
		{
           client.stream.write('hall', {id : 'login-success', msg : 'You are now logged on the server !'});
        }

    });
	
	wormhole(client.stream, 'connect', function ()
	{
		client.stream.write("Welcome, enter your username:\n");
	});
	
	wormhole(client.stream, 'error', function (e)
	{
		util.debug(e);
	});
});

util.log("Type " + "[start]".bold.green + " to launch the server");

process.on('uncaughtException', function(e)
{
	if (e.code == 'EADDRINUSE')
	{	
		setTimeout(function ()
		{
			console.log('Address in use, retrying...');
			serverStart();
		}, 2000);
	}
});

var serverStarted = false;
var serverStart = function()
{
	server.listen(program.port, function()
	{
		if (!serverStarted) // hack for listening
		{
			serverStarted = true;
			util.log(("Server started on port ".bold) + program.port.toString().bold.green);
		}
	});
}

rl.on('line', function (line)
{
	cmd = line.toLowerCase();
	
	if (cmd === 'start')
	{
		serverStart();
	}
	else if (cmd === 'users')
	{
		clients.forEach(function(c)
		{
			util.log("- " + c.name + "\n");
		});
	}
	else if (cmd === 'stop')
	{
		try
		{
			server.close();
			util.log("Server stopped.".bold);
		}
		catch (e)
		{
			util.debug(e.toString().red);
		}
	}
	else
	{
		util.debug("Unknow command for the server.".red);
	}

	
}).on('close', function()
{
	util.log("Program is exiting...".bold);
	
	process.exit(0);
	process.stdin.destroy();
});
