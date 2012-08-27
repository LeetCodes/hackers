/*
 * Command.js
 *
 * https://github.com/robinouu/hackers
 *
 * Copyright (c) 2010-2012 Robin Ruaux
 * Licensed under the new BSD license.
 */
 
var util = require('util'),
	net = require('net');
	
var Command = function(id, regex, callback)
{
	var self = this;
	
	var cmd =
	{
		id : id,
		
		regex : regex,
		
		exec: callback,
		
		check: function(stringCmd)
		{
			return stringCmd.match(regex);
		}
	};
	
	return cmd;
};

if (typeof module !== "undefined")
	module.exports = Command;
