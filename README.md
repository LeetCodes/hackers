# hackers #
[![Build Status](https://secure.travis-ci.org/robinouu/hackers.png?branch=master)](http://travis-ci.org/robinouu/hackers)
A MUD server and a client for a roleplay game in a futurist world

## Installation ##
Using npm package manager :

	npm install hackers
	
## Usage ##
hackers comes with a server program that you can launch using :

	node hackers-server.js
	
## Options ##

	-h, --help			output usage information
	-V, --version		output the version number
	-p, --port <port>   the port to listen for sockets connections
	-r, --retryInterval <milliseconds>	the number of milliseconds before restarting connection when an error occurs
	
By default, the server will listen to port **8081** and will retry a connection every **2 seconds**.

## Licence ##

hackers is distributed under the [BSD licence](https://github.com/robinouu/hackers/blob/master/LICENSE).

## Thanks to ! ##

hackers depends on [commander](https://npmjs.org/package/commander), [wormhole](https://npmjs.org/package/wormhole), and [colors](https://npmjs.org/package/colors) node.js modules, thanks to their respective authors for providing great tools !
