var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = 8000;

app.use('/', express.static(__dirname + '/'));
server.listen(port, function() {
	console.log('http listening on ' + port);
});

var keys = {
  P1: {
    UP: 87,
    DOWN: 83
  },
  P2: {
    UP: 38,
    DOWN: 40
  },
};

var keyP1 = false;
var keyP2 = false;

var votes = [
	{
		up: 0,
		down: 0,
		none: 0
	},
	{
		up: 0,
		down: 0,
		none: 0
	}
];

setInterval(function() {
	if (gameSocket) {
		gameSocket.emit('tick', [
			votes[0],
			votes[1]
		]);
	}
}, 100);

io.on('connection', function(socket){
  socket.on('isGame', function(value) {
  	handleGame(socket);
  });

  socket.on('isPlayer', function(team) {
  	handlePlayer(socket, team);
  })
});

var gameSocket;

function handleGame(socket) {
	if (gameSocket) {
		console.log('game tried to connect, but already existent. Denying new game.');
		socket.disconnect()
	}

	console.log('game connected');

	gameSocket = socket;

	emitTeamCount(0);
	emitTeamCount(1);

	socket.on('disconnect', function() {
		console.log('game disconnected');
		gameSocket = false;
	});
}

function handlePlayer(socket, team) {
	console.log('player connected to team ' + (team+1));

	var lastAction = false;

	socket.on('disconnect', function() {
		if (lastAction != false) {
			votes[team][lastAction]--;
		}
	});

	socket.on('control', function(value) {
		if (lastAction != false) {
			votes[team][lastAction]--;
		}

		var action = false;
		if (value == false) {
			action = 'none';
		} else if (['up', 'down'].indexOf(value) != -1) {
			action = value;
		} else {
			return;
		}

		votes[team][action]++;
		lastAction = action;
	});
}
