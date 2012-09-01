/*
 * RemoteConnector.js
 *
 * https://github.com/robinouu/hackers
 *
 * Copyright (c) 2010-2012 Robin Ruaux
 * Licensed under the new BSD license.
 */
 
var util = require('util'),
	net = require('net'),
	wormhole = require("wormhole");
	
var RemoteConnector = function()
{
	var self = this;
	this.socket = null;
};
	
RemoteConnector.prototype.connect = function (host, port)
{
	var self = this;
	
	self.socket = net.connect({host: host, port: port}, function()
	{
		util.log('Connected !');

		/*wormhole(self.socket, 'hall', function (data)
		{
			if (typeof data.msg !== 'undefined')
				util.log(data.msg);
		});*/
		
		self.socket.on('close', function(err)
		{
			if (err)
				util.debug(err);
				
			util.log('Disconnected from host.');
		});
	});
};

RemoteConnector.prototype.disconnect = function()
{
	this.socket.destroy();
	this.socket = null;
};

if (typeof module !== "undefined")
	module.exports = RemoteConnector;
