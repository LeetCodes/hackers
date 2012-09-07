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
	EventEmitter = require('events').EventEmitter,
	User = require("./User.js");

function Server()
{
	var self = this;
	
	this.started = false;
	this.users = [];
	
	var guestIndex = 1;
	
	EventEmitter.call(this);

	this.server = net.createServer(function (stream)
	{
		/* When a client connects */
		stream.on('connect', function()
		{
			/* Create a new user that we can recontact */
			var user = new User(stream);

			user.model.name = 'guest_' + guestIndex;
			++guestIndex;
			self.users.push(user);

			self.emit('userConnected', user);
			
			/* When the client disconnects */
			stream.on('end', function()
			{
				utils.arrayRemove(self.users, user);
				self.emit('userDisconnected', user);
			});			
		});
	});
	
	this.on('userDisconnected', function(user)
	{
		// Save user at exit
		if (user.model._id)
			user.model.save();
	});
};

util.inherits(Server, EventEmitter);
	
Server.prototype.start = function(port)
{
	var self = this;
	
	this.server.listen(port, '0.0.0.0', function()
	{
		self.emit('started', port);
	});
};
	
Server.prototype.stop = function()
{
	this.server.close();
	this.emit('stopped');
};

Server.prototype.broadcast = function(data)
{
	this.users.forEach(function(c)
	{
		c.stream.write(data);
	});
};

if (typeof module !== "undefined")
	module.exports = Server;
