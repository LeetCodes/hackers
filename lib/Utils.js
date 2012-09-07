/*
 * Utils.js
 *
 * https://github.com/robinouu/hackers
 *
 * Copyright (c) 2010-2012 Robin Ruaux
 * Licensed under the new BSD license.
 */

/**
 * Array remove method
 */
module.exports.arrayRemove = function(arr, e)
{
	for (var i = 0; i < arr.length; i++)
	{
		if (e == arr[i])
			return arr.splice(i, 1);
	}
};

/**
 * Macro for clearing screen
 */
module.exports.ClearScreen = '\033[2J\033[0f';
module.exports.NewLine = '\r\n';

/**
 * By TooTallNate, originally posted at https://gist.github.com/1785026
 * A quick little thingy that takes a Stream instance and makes
 * it emit 'line' events when a newline is encountered.
 *
 *   Usage:
 *  emitLines(process.stdin)
 *  process.stdin.resume()
 *  process.stdin.setEncoding('utf8')
 *  process.stdin.on('line', function (line) {
 *    console.log(line event:', line)
 *  })
 *
 */
module.exports.emitLines = function (stream)
{
	var backlog = '';
	
	stream.setEncoding("binary");
	
	stream.on('data', function (data)
	{
		backlog += data;
		
		var n = backlog.indexOf('\n');
		
		// got a \n? emit one or more 'line' events
		while (~n)
		{
			stream.emit('line', backlog.substring(0, n));
			backlog = backlog.substring(n + 1);
			n = backlog.indexOf('\n');
		}
	});
	
	stream.on('end', function ()
	{
		if (backlog)
			stream.emit('line', backlog);
	});
};


/* set main theme */
var colors = require('colors');
module.exports.colors;
colors.setTheme(
{
	command: 'green',
	argument: 'cyan',
	player: 'yellow',
	info: 'green',
	error: 'red',
	strong: 'bold'
});	
