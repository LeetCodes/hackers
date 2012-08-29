# hackers #
[![Build Status](https://secure.travis-ci.org/robinouu/hackers.png?branch=master)](http://travis-ci.org/robinouu/hackers)
A MUD server and a client for a roleplay game in a futurist world

## Installation ##
Using npm package manager :

	npm install hackers
	
## Launch the server ##
hackers comes with a server program that you can launch using :

	node hackers-server.js
	
#### Start the server ####
	
	> start
	You can also specify a port (**4000** by default) :
	> start 8081
	
#### Stop the server ####

	> stop

#### Display the number of connected clients ####

	> clients
	
#### Display the help ####

	> help

#### Quit the program ####

	> exit
	
## Launch the client ##

The client uses terminal commands like on the server tool :

	> connect (port)
	> disconnect
	> help	
	> exit
	
## Licence ##

hackers is distributed under the [BSD licence](https://github.com/robinouu/hackers/blob/master/LICENSE).

## Thanks to ! ##

hackers depends on the following libraries :
  - [colors](https://npmjs.org/package/colors)
  - [wormhole](https://npmjs.org/package/wormhole)
  - [xregexp](https://github.com/slevithan/xregexp)
  
Thanks to their respective authors for providing such a great tools !
