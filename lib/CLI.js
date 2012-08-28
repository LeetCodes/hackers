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
	prompt = require('prompt');

var CLI = function ()
{
	var cmds = [];
	var self = this;
	
	var cli = 
	{
		question: function(text)
		{
			
		},
		
		getCommand: function()
		{
			cli.prompt('server', function(err, line)
			{
				var found = false;
				cmds.forEach(function(item)
				{
					if (!found)
						found = item.exec(line.cli.trim());
				});
			});
		},
		
		prompt: function ()
		{
			var self = this;
			var callback;
			
			if (arguments.length == 1 && typeof(arguments[0]) === 'function')
			{
				prompt.message = '';
				callback = arguments[0];
			}
			else if (arguments.length == 2 && typeof(arguments[0]) === 'string')
			{
				prompt.message = arguments[0].bold.white;
				callback = arguments[1];
			}

			prompt.delimiter = " > ";

			var schema = {
				properties:
				{
					cli :
					{
						description: "cli".bold.white,
						pattern: /^[a-zA-Z]+$/,
						message: 'A command line must be only letters, spaces, numbers or dashes',
						required: true
					}
				}
			};

			prompt.start();
			
			if (callback)
			{
				prompt.get(schema, function (err, res) { callback(err, res); });
			}
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
		
		usage: function()
		{
			var c = '';
			
			cmds.forEach(function(item, i)
			{
				c += item.help + '\n';
			});
			
			return c;
		},
		
		autocomplete: function()
		{
			util.log('autocomplete');
		}
	};


	return cli;
};

if (typeof module !== "undefined")
	module.exports = CLI;
