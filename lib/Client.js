/*
 * Client.js
 *
 * https://github.com/robinouu/hackers
 *
 * Copyright (c) 2010-2012 Robin Ruaux
 * Licensed under the new BSD license.
 */
 
var util = require('util');
	
var Client = function (stream)
{
	var self = this;
	this.stream = stream;
};

if (typeof module !== "undefined")
	module.exports = Client;
