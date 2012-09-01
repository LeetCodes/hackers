/*
 * Server.js
 *
 * https://github.com/robinouu/hackers
 *
 * Copyright (c) 2010-2012 Robin Ruaux
 * Licensed under the new BSD license.
 */
 
var util = require('util'),
	utils = require("./Utils.js");
	net = require('net'),
	EventEmitter = require('events').EventEmitter,
	color = require("colors"),
	Client = require("./Client.js");
		
var Server = function()
{
	var self = this;
	
	this.started = false;
	this.clients = [];

	EventEmitter.call(this);

	this.server = net.createServer(function (stream)
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
	
	this.server.listen(port, function()
	{
		self.emit('started', port);
	});
};
	
Server.prototype.stop = function()
{
	this.server.close();
	this.emit('stopped');
};


if (typeof module !== "undefined")
	module.exports = Server;
