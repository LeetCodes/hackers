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
	color = require("colors"),
	EventEmitter = require('events').EventEmitter;

var Room = function (name, onload)
{
	name = typeof (name === string) : name ? 'unknow' + Math.floor(Math.random()*999);
	
	this.name = name;
	this.players = [];
	this.items = [];
	this.actions = [];
	this.channel = 'channel_' + name.toLowerCase();
	
	EventEmitter.call(this);
	
	if (typeof script === 'string')
		this.loadScript(script);
	else
		this.loadScript('data/rooms/' + name);
};

util.inherits(Room, EventEmitter);

Room.prototype.loadScript = function (scriptPath)
{
	var exists = fs.existsSync(path.normalize(scriptPath));
	
	if (!exists)
	{
		util.debug("Could not load room script at : \"" + scriptPath.toString() + "\"");
		return false;
	}
	
	return true;
};

if (typeof module !== "undefined")
	module.exports = Room;
