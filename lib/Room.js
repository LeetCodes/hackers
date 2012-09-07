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
	mongoose = require("mongoose"),
	EventEmitter = require('events').EventEmitter;

var envIndex = 0;

var RoomSchema = new mongoose.Schema(
{
	name: { type: String, required: true, index: true },
	email: { type: String, index: true },
	pass: {	type: String, required: true},
});

var RoomModel = mongoose.model('Room', RoomSchema);

var Room = function (name)
{
	var self = this;
	
	/* Initializing the room document */
	this.model = new RoomModel();
	
	if (typeof (name === 'string'))
		this.model.name = name;
	else
	{
		this.model.name = 'env_' + envIndex;
		++envIndex;
	}

	/* Configuring the room with default features */
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
		self.broadcast(player.model.name.toString().player.bold + " has joined." + utils.NewLine, [player]);
	});
	
	this.on('playerExited', function (player)
	{
		self.broadcast(player.model.name.toString().player.bold + " has left." + utils.NewLine, [player]);
		utils.arrayRemove(self.players, player);
	});
};

util.inherits(Room, EventEmitter);

/*
 * Broadcast the message to all players in the room.
 * This method accepts also an array of players to ignore the message.
 */
Room.prototype.broadcast = function(msg, exceptPlayerList)
{
	var self = this;
	
	if (typeof exceptPlayerList === 'undefined')
		exceptPlayerList = [];
		
	this.players.forEach(function(p)
	{
		if (exceptPlayerList.indexOf(p) === -1)
			p.send(msg);
	});
};

if (typeof module !== "undefined")
{
	module.exports = Room;
}

	