/*
 * CommandList.js
 *
 * https://github.com/robinouu/hackers
 *
 * Copyright (c) 2010-2012 Robin Ruaux
 * Licensed under the new BSD license.
 */
 
var util = require("util"),
	color = require("colors"),
	program = require("commander");

var CommandList = function ()
{
	var cmds = [];
	var self = this;
	
	var cmdList = 
	{
		prompt: function()
		{
			var self = this;
			program.prompt('> ', function(line)
			{	
				var found = false;
				
				cmds.forEach(function(item, i)
				{
					if (item.check(line))
					{
						item.exec(line);
						found = true;
					}
				});
				
				if (!found)
				{
					util.debug('Unknow command'.bold.red);
					self.prompt();
				}
			});
		},
		
		register: function (cmd)
		{
			if (typeof cmds === 'object')
				cmds.push(cmd);
		}
		
	};
	
	return cmdList;
};

if (typeof module !== "undefined")
	module.exports = CommandList;
