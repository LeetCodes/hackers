
/*
 * tests/server.js
 *
 * https://github.com/robinouu/hackers
 *
 * Copyright (c) 2010-2012 Robin Ruaux
 * Licensed under the new BSD license.
 */
 
var util = require('util'),

    // local
    Commands = require('../src/commands').Commands,
    Rooms    = require('../src/rooms').Rooms,
    Npcs     = require('../src/npcs').Npcs,
    Items    = require('../src/items').Items,
    Data     = require('../src/data').Data,
    Events   = require('../src/events').Events,
	Plugins  = require('../src/plugins'),

    // third party
    argv = require('optimist').argv,
    telnet = require('../src/3rdparty/telnet.js');
	

	// cmdline options
var locale  = argv.locale || 'en',
	port    = argv.port || 23,

	//storage of main game entities
	players,
	rooms = new Rooms(),
	items = new Items(),
	npcs  = new Npcs();

describe('hackers server', function()
{
	
	it('initializes', function()
	{
		Commands.configure(
		{
			rooms: rooms,
			players: players,
			items: items,
			npcs: npcs,
			locale: locale
		});

		Events.configure(
		{
			players: players,
			items: items,
			locale:  locale,
			npcs: npcs,
			rooms: rooms
		});

		var server = new telnet.Server(function (socket)
		{
			process.exit(0);
		});
		
		// start the server
		server.listen(port);

		Plugins.init(true,
		{
			players: players,
			items:   items,
			locale:  locale,
			npcs:    npcs,
			rooms:   rooms,
			server:  server
		});
	});
});	