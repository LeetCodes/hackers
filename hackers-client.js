/*
 * hackers-client.js
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

var pack = require("./package.json");

program
  .version(pack.version)
  .option('-n, --host [hostname]', 'The host to connect to. "localhost" by default.')
  .option('-p, --port <n>', 'The host\'s port to connect to. 8081 by default.', parseInt)
  .parse(process.argv);
  
if (typeof program.host !== 'string')
	program.host = 'localhost';
if (typeof program.port !== 'number' || program.port < 0)
	program.port = 8081;

util.log('Connecting to ' + (program.host + ':' + program.port).bold.green + '...');

var client = net.connect(program.port, program.host, function()
{
	util.log('Connected !');
	
	wormhole(client, 'hall', function (data)
	{
		if (typeof data.msg !== 'undefined')
			util.log(data.msg);
    });
});


var logged = false;
var currentChannel = 'hall';

rl.on('line', function (line)
{
	cmd = line.toLowerCase();
	
	if (cmd == "help")
	{
		
	}
	
}).on('close', function()
{
	util.log("Program is exiting...");
	
	process.exit(0);
	process.stdin.destroy();
});
