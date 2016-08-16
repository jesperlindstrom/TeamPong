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

app.post('/setTeams', function(req, res) {
  teams = req.body.teams;
  res.send('ok');
});

app.post('/setActiveTeams', function(req, res) {
  activeTeams = req.body.activeTeams;
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

function handleGame(socket) {
  console.log('game connected');

  gameSockets.push(socket);

  socket.on('disconnect', function() {
    console.log('game disconnected');
    var index = gameSockets.indexOf(socket);
    gameSockets.splice(index, 1);
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
