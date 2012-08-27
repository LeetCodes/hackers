/*
 * Client.js
 *
 * https://github.com/robinouu/hackers
 *
 * Copyright (c) 2010-2012 Robin Ruaux
 * Licensed under the new BSD license.
 */
 
var util = require('util'),
	net = require('net');
	
var Client = function(stream, username)
{
	var self = this;
	
	var client =
	{
		username : (typeof username === 'string') ? username : '',
		stream : stream,
		room : 'hall'
	};
	
	return client;
};

if (typeof module !== "undefined")
	module.exports = Client;
