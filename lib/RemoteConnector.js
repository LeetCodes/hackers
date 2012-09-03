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
	EventEmitter = require('events').EventEmitter;
	
var RemoteConnector = function()
{
	var self = this;
	this.socket = null;
	
	EventEmitter.call(this);
};

util.inherits(RemoteConnector, EventEmitter);
		
RemoteConnector.prototype.connect = function (host, port)
{
	var self = this;
	
	if (self.socket)
	{
		self.socket.end();
		self.socket.emit('alreadyConnected');
	}
		
	self.socket = net.connect({host: host, port: port}, function()
	{
		self.emit('connected');
	});

	self.socket.on('close', function(err)
	{
		self.emit('disconnected', err);
	});
};

RemoteConnector.prototype.send = function(channel, data)
{
	this.socket.write(channel, data);
};

RemoteConnector.prototype.disconnect = function()
{
	this.socket.destroy();
	this.socket = null;
};

if (typeof module !== "undefined")
	module.exports = RemoteConnector;
