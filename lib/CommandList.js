/*	
 * CommandList.js
 *
 * https://github.com/robinouu/hackers
 *
 * Copyright (c) 2010-2012 Robin Ruaux
 * Licensed under the new BSD license.
 */
 
var util = require("util"),
	utils = require("./Utils.js"),
	XRegExp = require("xregexp").XRegExp;
	
function compareAlphabeticalCmds(a, b)
{
	an = (typeof a.cmdGroup === 'string') ? a.cmdGroup : a.name;
	bn = (typeof b.cmdGroup === 'string') ? b.cmdGroup : b.name;
	
	if (an < bn)
		return -1;
	if (an > bn)
		return 1;

	return 0;
}

function CommandList(commands)
{
	var self = this;
	if (typeof commands === 'object')
		this.registerCommands(commands);
}

CommandList.prototype.browseCmds = function (cmds, cb, recursive)
{
	var self = this;
	
	cmds.forEach(function (c)
	{
		cb(c);
		if (c.cmdGroup && recursive)
			self.browseCmds(c.children, cb);
	});
};

CommandList.prototype.registerCommand = function (cmd)
{
	this.registerCommands([cmd]);
};

CommandList.prototype.registerCommands = function (cmds)
{
	var self = this;
	
	if (!this.cmds)
		this.cmds = [];
	self.browseCmds(cmds, function (command)
	{
		var cmd = (typeof command.cmdGroup === 'string') ? command.cmdGroup : command.cmd;
		command.compiledExpr = XRegExp('^' + cmd + '$');
		
		if (!command.name)
			command.name = cmd.split(' ')[0];
			
		self.cmds.push(command);
	}, true);

	this.cmds.sort(compareAlphabeticalCmds);

};

CommandList.prototype.unregisterCommand = function (cmd)
{
	var self = this;
	
	self.browseCmds(self.cmds, function(c)
	{
		if (c.name === cmd || c.cmdGroup === cmd)
			utils.arrayRemove(self.cmds, c)
	}, true);
};

CommandList.prototype.exec = function(line, sender)
{
	line = line.trim();
	var self = this;
	var found = false;

	this.browseCmds(this.cmds, function (command)
	{
		if (!found)
		{
			data = XRegExp.exec(line, command.compiledExpr);
			if (data)
			{
				if (command.callback)
				{
					/* Sanitize regexp data for having just named expression in args */
					d = {};

					for(var i in data)
					{
						if (!(parseInt(i) == i || i === 'index' || i === 'input'))
							d[i] = data[i];
					}

					command.callback(d, sender);
				}
				else if (typeof command.cmdGroup === 'string')
				{
					if (command.callback)
						command.callback(self.usage(command.cmdGroup));
					else
						util.log(self.usage(command.cmdGroup));
				}
				found = true;
			}
		}
	}, true);
	
	if (!found)
		util.debug('Unknow command '.bold.red);
}	

CommandList.prototype.usage = function (cmd)
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
		return '\n\nUsage:\n\n' + c;
	return '';
}
	
if (typeof module !== "undefined")
	module.exports = CommandList;
