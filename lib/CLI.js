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
	program = require("commander");
	
var CLI = function ()
{
	var cmds = [];
	var self = this;
	
	var cli = 
	{
		prompt: function()
		{
			var self = this;
			program.prompt('> ', function(line)
			{	
				var found = false;
				
				cmds.forEach(function(item, i)
				{
					if (!found)
						found = item.exec(line);
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
			if (Object.prototype.toString.call(cmd) === '[object Array]')
			{
				cmd.forEach(function(item)
				{
					cmds.push(item);
				});
			}
			else if (typeof cmds === 'object')
			{
				cmds.push(cmd);
			}
		},
		
		
	};
	
	return cli;
};

if (typeof module !== "undefined")
	module.exports = CLI;
