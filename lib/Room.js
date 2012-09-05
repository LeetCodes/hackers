/*
 * Room.js
 *
 * https://github.com/robinouu/hackers
 *
 * Copyright (c) 2010-2012 Robin Ruaux
 * Licensed under the new BSD license.
 */
 
var path = require('path'),
	util = require('util'),
	utils = require("./Utils.js"),
	CommandList = require("./CommandList.js"),
	color = require("colors"),
	EventEmitter = require('events').EventEmitter;

var envIndex = 0;
var Room = function (name)
{
	var self = this;
	
	if (typeof (name === 'string'))
		this.name = name;
	else
	{
		this.name = 'env_' + envIndex;
		++envIndex;
	}
	
	this.players = [];
	this.actions = [
	{
		name: 'say',
		cmd: 'say (?<msg>.+)?',
		help: ("say " + "<msg>".cyan).bold + "\tSends your message to the current room",
		callback: function (data, sender)
		{
			self.broadcast('[' + sender.toString().bold.green + '] ' + data.msg.substring(0, 250) + '\n');
		}
	}];

	EventEmitter.call(this);
	
	this.on('playerEntered', function (player)
	{
		player.availableCommands.registerCommands(this.actions);
		self.players.push(player);
		self.broadcast(player.username.toString().player.bold + " has joined." + utils.NewLine);
	});
	
	this.on('playerExited', function (player)
	{
		utils.arrayRemove(self.players, player);
		
		self.broadcast(player.username.toString().player.bold + " has left." + utils.NewLine);
	});
};

util.inherits(Room, EventEmitter);
	
Room.prototype.broadcast = function(msg)
{
	var self = this;
	
	this.players.forEach(function(p)
	{
		p.send(msg);
	});
};

if (typeof module !== "undefined")
{
	module.exports = Room;
}

	