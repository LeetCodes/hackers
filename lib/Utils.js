/*
 * Utils.js
 *
 * https://github.com/robinouu/hackers
 *
 * Copyright (c) 2010-2012 Robin Ruaux
 * Licensed under the new BSD license.
 */

Array.prototype.remove = function(e)
{
	for (var i = 0; i < this.length; i++)
	{
		if (e == this[i])
			return this.splice(i, 1);
	}
};


module.exports.isFunction = function (functionToCheck)
{
	var getType = {};
	return functionToCheck && getType.toString.call(functionToCheck) == '[object Function]';
}