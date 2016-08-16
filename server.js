var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var bodyParser = require('body-parser');
var port = 8000;

app.use('/', express.static(__dirname + '/'));
app.use(bodyParser.urlencoded({
  extended: true
}));

server.listen(port, function() {
  console.log('http listening on ' + port);
});

var teams = ['Team 1', 'Team 2'];
var activeTeams = [0, 1];
var gameSockets = [];
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

function resetVotes() {
  var oldVotes = votes;

  votes = [];

  for (i in teams) {
    votes[i] = oldVotes[i] || { up: 0, down: 0, none: 0 };
  }
}

app.post('/setTeams', function(req, res) {
  teams = req.body.teams;
  io.emit('teams', teams);

  resetVotes();

  res.send('ok');
});

app.post('/setActiveTeams', function(req, res) {

  var activeTeamsInt = [];

  for (i in req.body.activeTeams) {
    activeTeamsInt.push(parseInt(req.body.activeTeams[i]));
  }

  activeTeams = activeTeamsInt;
  io.emit('activeTeams', activeTeams);

  resetVotes();

  res.send('ok');
});

app.get('/getTeams', function(req, res) {
  res.send(JSON.stringify({
    teams: teams,
    activeTeams: activeTeams
  }));
});

app.get('/reset', function(req, res) {
  io.emit('reset');
  res.send('ok');
});

function emitAll(sockets, k, v) {
  sockets.forEach(function(socket) {
    socket.emit(k, v);
  });
}

app.get('/togglePause', function(req, res) {
  res.send('ok');
  emitAll(gameSockets, 'togglePause');
});

setInterval(function() {
  if (gameSockets.length) {
    emitAll(gameSockets, 'tick', [
      votes[activeTeams[0]],
      votes[activeTeams[1]]
    ]);
  }
}, 100);

io.on('connection', function(socket){
  socket.emit('teams', teams);

  socket.on('isGame', function(value) {
    handleGame(socket);
  });

  socket.on('isPlayer', function(team) {
    handlePlayer(socket, team);
  })
});

function handleGame(socket) {
  console.log('game connected');

  socket.emit('activeTeams', activeTeams);
  gameSockets.push(socket);

  socket.on('disconnect', function() {
    console.log('game disconnected');
    var index = gameSockets.indexOf(socket);
    gameSockets.splice(index, 1);
  });
}

function handlePlayer(socket, team) {
  console.log('player connected to team ' + (team+1));
  socket.emit('activeTeams', activeTeams);

  function checkTeamValidity() {
    if (!votes[team]) {
      socket.emit('invalidTeam');
      return false;
    }

    return true;
  }

  if (!checkTeamValidity()) {
    return;
  }

  var lastAction = false;

  socket.on('disconnect', function() {
    if (!checkTeamValidity()) {
      return;
    }
      
    if (lastAction != false) {
      votes[team][lastAction]--;
    }
  });

  socket.on('control', function(value) {
    if (!checkTeamValidity()) {
      return;
    }

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
