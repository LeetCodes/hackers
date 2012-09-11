#!/usr/bin/env node
/**
 * Main file, use this to run the server:
 * node hackers [options]
 *
 * Options:
 *   -v Verbose loggin
 *   --port Port to listen on
 *   --locale Locale to act as the default
 *   --save Minutes between autosave
 *   --respawn Minutes between respawn
 */


// built-ins
var util = require('util');

// local
var Commands = require('../server/src/commands').Commands;
var Rooms    = require('../server/src/rooms').Rooms;
var Npcs     = require('../server/src/npcs').Npcs;
var Items    = require('../server/src/items').Items;
var Events   = require('../server/src/events').Events;
var Plugins  = require('../server/src/plugins');
var PlayerManager = require('../server/src/player_manager').PlayerManager;

// third party
var Localize  = require('localize');
var argv = require('optimist').argv;
var telnet = require('../server/src/3rdparty/telnet.js');

/**
 * These aren't really globals, they're only "global" to this file,
 * we'll pass them around via construction as needed
 */
	// cmdline options
var locale  = argv.locale || 'en';
var port    = parseInt(argv.port || process.env.PORT || 4000, 10);
var verbose = !!argv.v;
var save_interval    = isNaN(parseInt(argv.save, 10)) ? 10 : parseInt(argv.save, 10); // number of minutes between autosave ticks
var respawn_interval = isNaN(parseInt(argv.respawn, 10)) ? 20 : parseInt(argv.respawn, 10); // "" between respawn tickets

//storage of main game entities
var players;
var rooms = new Rooms();
var items = new Items();
var npcs = new Npcs();
var server;
	
// Stuff for the server executable
var l10n;

/**
 * Do the dirty work
 */
var init = function (restart_server)
{
	util.log("START - Loading entities");
	players = new PlayerManager([]);
	restart_server = typeof restart_server === 'undefined' ? true : restart_server;

	Commands.configure({
		rooms: rooms,
		players: players,
		items: items,
		npcs: npcs,
		locale: locale
	});

	Events.configure({
		players: players,
		items: items,
		locale:  locale,
		npcs: npcs,
		rooms: rooms
	});

	if (restart_server) {
		util.log("START - Starting server");
/**
 * Effectively the 'main' game loop but not really because it's a REPL
 */
		server = new telnet.Server(function (socket) {
			socket.on('interrupt', function () {
				socket.write("\n*interrupt*\n");
			});

			// Register all of the events
			for (var event in Events.events) {
				socket.on(event, Events.events[event]);
			}

			socket.write("Connecting...\n");
			util.log("User connected...");
			// @see: src/events.js - Events.events.login
			socket.emit('login', socket);

		});

		// start the server
		server.listen(port);

		// save every 10 minutes
		util.log("Setting autosave to " + save_interval + " minutes.");
		clearInterval(saveint);
		var saveint = setInterval(save, save_interval * 60000);

		// respawn every 20 minutes, probably a better way to do this
		util.log("Setting respawn to " + respawn_interval + " minutes.");
		clearInterval(respawnint);
		var respawnint = setInterval(load, respawn_interval * 60000);

		Plugins.init(true, {
			players: players,
			items:   items,
			locale:  locale,
			npcs:    npcs,
			rooms:   rooms,
			server:  server
		});
	}

	load(function (success) {
		if (success) {
			util.log("Server started...");
			server.emit('startup');
		} else {
			process.exit(1);
		}
	});
};


describe("hackers server", function ()
{
	it("starts up", function ()
	{
		init();
	});
});


/**
 * Save all connected players
 */
function save()
{
	util.log("Saving...");
	players.each(function (p) {
		p.save();
	});
	util.log("Done");
}

/**
 * Load rooms, items, npcs. Register items and npcs to their base locations.
 * Configure the event and command modules after load. Doubles as a "respawn"
 */
function load(callback)
{
	util.log("Loading rooms...");
	rooms.load(verbose, function () {
		util.log("Done.");
		util.log("Loading items...");
		items.load(verbose, function () {
			util.log("Done.");

			util.log("Adding items to rooms...");
			items.each(function (item) {
				if (item.getRoom()) {
					var room = rooms.getAt(item.getRoom());
					if (!room.hasItem(item.getUuid())) {
						room.addItem(item.getUuid());
					}
				}
			});
			util.log("Done.");

			util.log("Loading npcs...");
			npcs.load(verbose, function () {
				util.log("Done.");

				util.log("Adding npcs to rooms...");
				npcs.each(function (npc) {
					if (npc.getRoom()) {
						var room =rooms.getAt(npc.getRoom());
						if (!room.hasNpc(npc.getUuid())) {
							room.addNpc(npc.getUuid());
						}
					}
				});
				util.log("Done.");
				if (callback) {
					callback(true);
				}
			});
		});
	});
}


// Not game stuff, this is for the server executable
process.stdin.setEncoding('utf8');
l10n = new Localize(require('js-yaml').load(require('fs').readFileSync(__dirname + '/../server/l10n/server.yml').toString('utf8')), undefined, 'zz');

/**
 * Commands that the server executable itself accepts
 */
var server_commands = {
/**
 * Hotboot, AKA do everything involved with a restart but keep players connected
 */
	hotboot : function (args)
	{
		args = args ? args.split(' ') : [];
		var warn = args[0] && args[0] === 'warn';
		var time = args[0] ? parseInt(args[warn ? 1 : 0], 10) : 0;

		if (time && time < 20) {
			console.log("Gotta give the players a bit longer than that, might as well do it instantly...");
			return;
		}
		time = time ? time * 1000 : 0;

		if (warn) {
			warn = function (interval) {
				players.broadcastL10n(l10n, 'HOTBOOT_WARN', interval);
				players.each(function(p) {p.prompt();});
			};
			warn(time / 1000 + " seconds");
			setTimeout(function () { warn(Math.floor((time / 4) / 1000) + " seconds"); }, time - Math.floor(time / 4));
		}

		util.log("HOTBOOTING SERVER" + (time ? " IN " + (time / 1000) + " SECONDS " : ''));
		setTimeout(function () {
			util.log("HOTBOOTING...");
			save();
			init(false);
		}, time);
	},
/**
 * Hard restart: saves and disconnects all connected players
 */
	restart: function (args)
	{
		args = args ? args.split(' ') : [];
		var warn = args[0] && args[0] === 'warn';
		var time = args[0] ? parseInt(args[warn ? 1 : 0], 10) : 0;

		if (time && time < 20) {
			console.log("Gotta give the players a bit longer than that, might as well do it instantly...");
			return;
		}
		time = time ? time * 1000 : 0;

		if (warn) {
			warn = function (interval) {
				players.broadcastL10n(l10n, 'RESTART_WARN', interval);
				players.each(function(p) {p.prompt();});
			};
			warn(time / 1000 + " seconds");
			setTimeout(function () { warn(Math.floor((time / 4) / 1000) + " seconds"); }, time - Math.floor(time / 4));
		}

		util.log("RESTARTING SERVER" + (time ? " IN " + (time / 1000) + " SECONDS " : ''));
		setTimeout(function () {
			util.log("RESTARTING...");
			save();
			server.emit('shutdown');
			server.close();
			players.each(function (p) { p.getSocket().end(); });
			init(true);
		}, time);
	}
};

process.stdin.resume();
process.stdin.on('data', function (data)
{
	data = data.trim();
	var command = data.split(' ')[0];
	
	if (!(command in server_commands)) {
		console.log("That's not a real command...");
		return;
	}

	server_commands[command](data.split(' ').slice(1).join(' '));
});
