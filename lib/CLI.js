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
	var cmds = [];
	var self = this;

	var rl = readline.createInterface(
	{
		input: process.stdin,
		output: process.stdout,
		completer: function (line)
		{
			var hits = [];
			
			self.cmds.forEach(function(item, i)
			{
				if (item.name.indexOf(line) == 0)
					hits.push(item.name);
			});
			
			return [hits, line]	
		}
	});
	
	rl.on('line', function(line)
	{
		line = line.trim();
		
		var found = false;
		self.cmds.forEach(function(item)
		{
			if (!found)
			{
				
				data = XRegExp.exec(line, item.compiledExpr);
				if (data)
					item.callback(data);
			}
			
		});

		cli.prompt();
	});

	var cli = 
	{
		readline : rl,
		
		prompt: function (promptTxt)
		{
			rl.prompt();
		},
		
		question: function (query, callback)
		{
			return rl.question(query, callback);
		},
		
		registerCommands: function (commands)
		{
			buf = [];
			commands.forEach(function (item, i)
			{
				item.compiledExpr = XRegExp(item.cmd);
				item.name = item.cmd.split(' ')[0];
			});
			self.cmds = commands;
		},
		
		usage: function()
		{
			var c = '';
			
			cmds.forEach(function (item, i)
			{
				if (typeof item.help === 'string' && item.help.trim() != '')
					c += item.help + '\n';
			});
			
			return c;
		}
	};
	
	events.EventEmitter.call(this);
	
	
	return cli;
};

if (typeof module !== "undefined")
	module.exports = CLI;
