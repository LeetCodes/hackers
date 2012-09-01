/*
 * Utils.js
 *
 * https://github.com/robinouu/hackers
 *
 * Copyright (c) 2010-2012 Robin Ruaux
 * Licensed under the new BSD license.
 */

module.exports.arrayRemove = function(arr, e)
{
	for (var i = 0; i < arr.length; i++)
	{
		if (e == arr[i])
			return arr.splice(i, 1);
	}
};


module.exports.isFunction = function (functionToCheck)
{
	var getType = {};
	return functionToCheck && getType.toString.call(functionToCheck) == '[object Function]';
}