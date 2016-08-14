var proxy = new (function() {
  var socket = io();
  socket.emit('isGame', '1');
  socket.on('disconnect', function() {
    alert('Disconnected. Are you already running the game?');
  });
  
  var $team1 = $('#team1');
  var $team2 = $('#team2');

  socket.on('playerCountTeam', function(data) {
    console.log(data);
    if (data.team == 0) {
      $team1.html(data.count);
    } else if (data.team == 1) {
      $team2.html(data.count);
    }
  });

  var pressedKeys = [];

  socket.on('keydown', function(keyCode) {
    console.log('keyDown', keyCode);
    
    if (!(keyCode in pressedKeys)) {
      pressedKeyspush(keyCode);
    }

    console.log(pressedKeys);
  });

  socket.on('keyup', function(keyCode) {
    console.log('keyUp', keyCode);

    var index = pressedKeys.indexOf(keyCode);

    if (index != -1) {
      pressedKeys.splice(index, 1);
    }

    console.log(pressedKeys);
  });

  this.isDown = function(keyCode) {
    return keyCode in pressedKeys;
  };
});