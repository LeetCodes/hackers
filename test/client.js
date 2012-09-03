/*
 * tests/server.js
 *
 * https://github.com/robinouu/hackers
 *
 * Copyright (c) 2010-2012 Robin Ruaux
 * Licensed under the new BSD license.
 */

var util = require('util'),
	RemoteConnector = require('../lib/RemoteConnector.js'),
	Server = require('../lib/Server.js'),
	assert = require("assert")

describe('hackers client', function()
{
	var server = null;
	var connector = null;
	
	/* -------------------------------------------------- */
	it('launches the server', function()
	{
		server = new Server();
		server.start(4000);
	});

	/* -------------------------------------------------- */
	it('initializes RemoteConnector', function()
	{
		connector = new RemoteConnector();

		connector.on('connected', function ()
		{
			connector.disconnect();
		});

		connector.on('disconnected', function (err)
		{
			assert.equal(typeof err, 'undefined');
			server.close();
		});
	});
	
	/* -------------------------------------------------- */
	it('connects and disconnect from the server', function()
	{
		connector.connect('localhost', 4000);
	});

});	
