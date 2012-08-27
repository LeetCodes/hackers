/*
 * Command.js
 *
 * https://github.com/robinouu/hackers
 *
 * Copyright (c) 2010-2012 Robin Ruaux
 * Licensed under the new BSD license.
 */
 
var util = require('util'),
	net = require('net'),
	XRegExp = require("xregexp").XRegExp;
	
var Command = function(id, helpMsg, callback)
{
	var self = this;
	var compiledExpr = XRegExp(id, 'x');
	
	var cmd =
	{
		id : id,
		
		help : helpMsg,
		
		regex : compiledExpr,
		
		exec: function(stringCmd)
		{
			var res = XRegExp.exec(stringCmd, compiledExpr);
			
			if (typeof res === 'object' && res)
			{
				callback(res);
				return true;
			}
			return false;
		},

	};
	
	return cmd;
};

if (typeof module !== "undefined")
	module.exports = Command;
