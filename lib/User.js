/*
 * User.js
 *
 * https://github.com/robinouu/hackers
 *
 * Copyright (c) 2010-2012 Robin Ruaux
 * Licensed under the new BSD license.
 */
 
var util = require('util'),
	utils = require("./Utils.js"),
	CommandList = require('./CommandList.js');

var userIndex = 1;
var User = function (stream)
{
	var self = this;
	
	this.stream = stream;

	this.availableCommands = new CommandList([
	{
		cmd: 'login',
		help: "login".bold + "\t" + "<username> <password>".bold.cyan + "\tAdd a unique user to the database",
		callback: function()
		{
			
		}
	}]);
	
	/* id of the user in database, null by default to prevent unauthorized connections */
	this._id = null; 
	this.username = 'guest' + userIndex; ++userIndex;
	this.room = null;
	
	/* Support for Windows telnet terminals */
	utils.emitLines(stream);
	
	stream.on('line', function (line)
	{
		self.availableCommands.exec(line, self.username);
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

User.prototype.send = function (data)
{
	/* TODO : encryption feature */
	if (typeof data === 'object')
		this.stream.write(JSON.stringify(data));
	else if (typeof data === 'string')
		this.stream.write(data);
};

if (typeof module !== "undefined")
	module.exports = User;
