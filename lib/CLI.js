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

CLI.prototype.browseCmds = function (cmds, cb, recursive)
{
	var self = this;
	
	cmds.forEach(function (c)
	{
		cb(c);
		if (c.cmdGroup && recursive)
			self.browseCmds(c.children, cb);
	});
};


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
		
		self.browseCmds(self.cmds, function (command)
		{
			if (!found)
			{
				data = XRegExp.exec(line, command.compiledExpr);
				if (data)
				{
					if (command.callback)
						command.callback(data)
					else if (typeof command.cmdGroup === 'string')
						util.log(self.usage(command.cmdGroup));
					found = true;
				}
			}
		}, true);
		
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
		
CLI.prototype.registerCommands = function (cmds)
{
	buf = [];
	this.browseCmds(cmds, function (command)
	{
		var cmd = (typeof command.cmdGroup === 'string') ? command.cmdGroup : command.cmd;
		command.compiledExpr = XRegExp('^' + cmd + '$');
		command.name = cmd.split(' ')[0];
	}, true);
	this.cmds = cmds;
};

CLI.prototype.usage = function(cmd)
{
	var self = this;
	
	var c = '';
	
	/* Draw all top level commands */
	if (typeof cmd === 'undefined')
	{
		self.browseCmds(self.cmds, function (command)
		{
			if (typeof command.help === 'string' && command.help.trim() != '')
				c += '  ' + command.help + '\n';
		}, false);
	}

	/* When a comment is specified */
	else if (typeof cmd === 'string')
	{
		cmd = cmd.toLowerCase();
		
		self.browseCmds(self.cmds, function (command)
		{
			if (cmd === command.cmdGroup)
			{
				command.children.forEach(function (child)
				{
					c += '  ' + child.help + '\n';
				});
			}
			else if (cmd === command.cmd)
				c += '  ' + command.help + '\n';
				
		}, true);
	}
	
	if (c !== '')
		return 'Usage:\n' + c;
	return '';
}
	

if (typeof module !== "undefined")
	module.exports = CLI;
