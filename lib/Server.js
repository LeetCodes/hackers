/*
 * Server.js
 *
 * https://github.com/robinouu/hackers
 *
 * Copyright (c) 2010-2012 Robin Ruaux
 * Licensed under the new BSD license.
 */
 
var net = require('net'),
	util = require('util'),
	utils = require("./Utils.js"),
	color = require("colors"),
	EventEmitter = require('events').EventEmitter,
	Client = require("./Client.js");
		
function Server()
{
	var self = this;
	
	this.started = false;
	this.clients = [];

	EventEmitter.call(this);

	this.s = net.createServer(function (stream)
	{
		stream.setEncoding("utf8");
		
		/* When a client connects */
		stream.on('connect', function()
		{
			/* Save its stream in memory */
			var client = new Client(stream);
			self.clients.push(client);

			self.emit('clientConnected', client);
			
			/* When the client disconnects */
			stream.on('close', function()
			{
				self.clients.forEach(function(item)
				{
					if (item.stream === stream)
					{
						utils.arrayRemove(self.clients, item);
					}
				});
				
				self.emit('clientDisconnected', client);
			});
		});

	});
};

util.inherits(Server, EventEmitter);
	
Server.prototype.start = function(port)
{
	var self = this;
	
	this.s.listen(port, '0.0.0.0', function()
	{
		self.emit('started', port);
	});
};
	
Server.prototype.stop = function()
{
	this.s.close();
	this.emit('stopped');
};

Server.prototype.broadcast = function(channel, data)
{
	this.clients.forEach(function(c)
	{
		c.stream.write(channel, data);
	});
};

if (typeof module !== "undefined")
	module.exports = Server;
