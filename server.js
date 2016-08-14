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

function getActionFromVotes(votes) {
	console.log(votes);
	var max = 0;
	var maxAction = ['none'];

	for (action in votes) {
		if (votes[action] > max) {
			maxAction = [action];
			max = votes[action];
		} else if (votes[action] == max) {
			maxAction.push(action);
		}
	}

	// Has to be one winner, else it returns none
	if (maxAction.length == 1) {
		return maxAction[0];
	}

	return 'none';
};

setInterval(function() {
	var actions = [
		getActionFromVotes(votes[0]),
		getActionFromVotes(votes[1])
	];

	console.log(actions);

	if (gameSocket) {
		gameSocket.emit('tick', actions);
	}
}, 300);

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

function emitTeamCount(team) {
	if (!gameSocket) return;

	gameSocket.emit('playerCountTeam', {
		team: team,
		count: players[team]
	});
}

function handlePlayer(socket, team) {
	players[team]++;
	console.log('player connected to team ' + (team+1) + ' (' + players[team] + ' total)');

	emitTeamCount(team);

	var lastAction = false;

	socket.on('disconnect', function() {
		players[team]--;

		if (lastAction != false) {
			votes[team][lastAction]--;
		}

		console.log('player disconnected');

		emitTeamCount(team);
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
