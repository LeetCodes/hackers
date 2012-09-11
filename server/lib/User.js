/*
 * User.js
 *
 * https://github.com/robinouu/hackers
 *
 * Copyright (c) 2010-2012 Robin Ruaux
 * Licensed under the new BSD license.
 */
 
var utils = require("./Utils.js"),
	mongoose = require("mongoose"),
	CommandList = require('./CommandList.js');
	
var UserSchema = new mongoose.Schema(
{
	name: { type: [String], index: true, trim: true },
	pass: {	type: [String], index: true },
	room: { type: [String] }
});

var UserModel = mongoose.model('User', UserSchema);

var User = function (stream)
{
	var self = this;
	
	this.stream = stream;
	this.room = null;
	this.availableCommands = new CommandList();
	
	/* id of the user in database, null by default to prevent unauthorized connections */
	/* Initializing the room document */
	this.model = new UserModel();

	/* Support for Windows telnet terminals */
	utils.emitLines(stream);
	
	stream.on('line', function (line)
	{
		self.availableCommands.exec(line, self.model.name);
	});
};

User.prototype.gotoRoom = function (room)
{
	if (this.room && this.room !== room)
	{
		utils.arrayRemove(this.room.players, this);
		this.room.emit('playerExited', this);
	}
	this.room = room;
	this.room.emit('playerEntered', this);
}

var iconv = require('iconv-lite');
User.prototype.send = function (data)
{
	/* TODO : encryption feature */
	this.stream.write(iconv.encode(data, 'binary'));
};

if (typeof module !== "undefined")
	module.exports = User;
