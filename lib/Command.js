/*
 * Command.js
 *
 * https://github.com/robinouu/hackers
 *
 * Copyright (c) 2010-2012 Robin Ruaux
 * Licensed under the new BSD license.
 */
 
var util = require('util'),
	utils = require("./Utils.js"),
	net = require('net'),
	XRegExp = require("xregexp").XRegExp;
	
var Command = function(id, helpMsg, regexp, callback)
{
	var self = this;

	var compiledExpr = XRegExp(regexp, 'x');

	var cmd =
	{
		id : id,
		
		help : helpMsg,
		
		regex : compiledExpr,
		
		exec: function(stringCmd)
		{
			var res = compiledExpr.test(stringCmd);
			
			if (res)
			{
				callback(XRegExp.exec(stringCmd, compiledExpr));
				return true;
			}
			return false;
		},

	};
	
	return cmd;
};

if (typeof module !== "undefined")
	module.exports = Command;
