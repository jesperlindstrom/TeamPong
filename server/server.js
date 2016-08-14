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

var players = [0, 0];

var p1Action = false;
var p1Votes = {
	up: 0,
	down: 0,
	none: 0
};

var p2Action = false;
var p2Votes = {
	up: 0,
	down: 0,
	none: 0
};

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

	socket.on('disconnect', function() {
		console.log('game disconnected');
		gameSocket = false;
	});
}

function handlePlayer(socket, team) {
	players[team]++;
	console.log('player connected');

	if (gameSocket) {
		gameSocket.emit('playerCountTeam', {
			team: team,
			count: players[team]
		});
	}

	socket.on('disconnect', function() {
		players[team]--;
		console.log('player disconnected');
	});
}
