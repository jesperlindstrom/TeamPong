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

  function actionToKeyCode(team, action) {
    if (team == 0) {
      if (action == 'up')
        return 87;

      if (action == 'down')
        return 83;

      return false;
    }

    if (team == 1) {
      if (action == 'up')
        return 38;

      if (action == 'down')
        return 40;

      return false;
    }
  }

  var pressedKeys = [];

  socket.on('tick', function(actions) {
    pressedKeys = [
      actionToKeyCode(0, actions[0]),
      actionToKeyCode(1, actions[1])
    ];
  });

  this.isDown = function(keyCode) {
    return keyCode in pressedKeys;
  };
});