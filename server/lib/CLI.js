/*	
 * CLI.js
 *
 * https://github.com/robinouu/hackers
 *
 * Copyright (c) 2010-2012 Robin Ruaux
 * Licensed under the new BSD license.
 */
 
var util = require("util"),
	events = require('events'),
	readline = require('readline'),
	CommandList = require('./CommandList.js');

function CLI()
{
	var self = this;

	this._completer = function (line)
	{
		var hits = [];
		
		self.cmdList.browseCmds(self.cmdList.cmds, function(item)
		{
			if (item.name.indexOf(line) === 0)
				hits.push(item.name);
		});
		
		return [hits, line];
	};
	
	this.cmdList = new CommandList();
	
	events.EventEmitter.call(this);
	
	this.reset();
}

util.inherits(CLI, events.EventEmitter);
	
CLI.prototype.reset = function()
{
	var self = this;
	
	var opts = {
		input: process.stdin,
		output: process.stdout,
		completer: self._completer
	};
	
	this.rl = readline.createInterface(opts);

	this.rl.on('line', function (line)
	{
		self.cmdList.exec(line);
		self.prompt();
	});
	
	this.rl.on('close', function ()
	{
		self.emit('close');
	});
};

CLI.prototype.close = function()
{
	this.rl.close();
};

CLI.prototype.prompt = function (promptTxt)
{
	this.rl.prompt(true);
};

CLI.prototype.question = function (query, callback)
{
	return this.rl.question(query,callback);
};


if (typeof module !== "undefined")
	module.exports = CLI;
