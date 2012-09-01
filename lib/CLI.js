/*	
 * CLI.js
 *
 * https://github.com/robinouu/hackers
 *
 * Copyright (c) 2010-2012 Robin Ruaux
 * Licensed under the new BSD license.
 */
 
var util = require("util"),
	color = require("colors"),
	events = require('events'),
	readline = require('readline'),
	XRegExp = require("xregexp").XRegExp;

function CLI()
{
	var self = this;

	this._completer = function (line)
	{
		var hits = [];
		
		self.cmds.forEach(function(item, i)
		{
			if (item.name.indexOf(line) == 0)
				hits.push(item.name);
		});
		
		return [hits, line]	
	};
	
	this.cmds = [];
	
	events.EventEmitter.call(this);
	
	this.reset();
}


CLI.prototype.reset = function()
{
	var self = this;
	
	this.rl = readline.createInterface(
	{
		input: process.stdin,
		output: process.stdout,
		completer: self._completer
	});
	
	this._lineParser = function(line)
	{
		line = line.trim();
		
		var found = false;
		self.cmds.forEach(function(item)
		{
			if (!found)
			{
				data = XRegExp.exec(line, item.compiledExpr);
				if (data)
				{
					item.callback(data);
					found = true;
				}
			}
			
		});
		
		if (!found)
			util.debug('Unknow command '.bold.red);

		self.prompt();
	}

	this.rl.on('line', this._lineParser);
}
	
CLI.prototype.prompt = function (promptTxt)
{
	this.rl.prompt(true);
};

CLI.prototype.question = function (query, callback)
{
	return this.rl.question(query,callback);
};
		
CLI.prototype.registerCommands = function (commands)
{
	buf = [];
	commands.forEach(function (item, i)
	{
		item.compiledExpr = XRegExp('^' + item.cmd + '$');
		item.name = item.cmd.split(' ')[0];
	});
	this.cmds = commands;
};

CLI.prototype.usage = function(cmd)
{
	var c = '';
	if (typeof cmd === 'undefined')
	{
		this.cmds.forEach(function (item, i)
		{
			if (typeof item.help === 'string' && item.help.trim() != '')
				c += '  ' + item.help + '\n';
		});
	}
	else 
	{
		cmd = cmd.toLowerCase();
		this.cmds.forEach(function (item, i)
		{
			if (item.name === cmd)
				c = '  ' + item.help + '\n';
		});
	}
	
	if (c !== '')
		return 'Usage:\n' + c;
	return '';
}
	

if (typeof module !== "undefined")
	module.exports = CLI;
