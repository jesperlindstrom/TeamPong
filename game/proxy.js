var proxy = new (function() {
  var socket = io();
  socket.emit('isGame', '1');
  socket.on('disconnect', function() {
    alert('Disconnected');
    reset();
    $('canvas').hide();
    window.location.reload(true);
    p1.score = 0;
    p2.score = 0;
  });

  socket.on('reset', function() {
    reset();
    window.manuallyStopped = true;
    clearInterval(window.startInterval);
    window.startInterval = false;
    p1.score = 0;
    p2.score = 0;
  });

  var teamNames = ['team 1', 'team 2'];
  var activeTeams = [0, 1];

  function updateTeamNames() {
    $('#left-name').html(teamNames[activeTeams[0]]);
    $('#right-name').html(teamNames[activeTeams[1]]);
  }

  socket.on('teams', function(names) {
    teamNames = names;
    updateTeamNames();
  });

  socket.on('activeTeams', function(active) {
    activeTeams = active;
    updateTeamNames();
    reset();
    window.manuallyStopped = true;
    clearInterval(window.startInterval);
    window.startInterval = false;
    p1.score = 0;
    p2.score = 0;
  });

  socket.on('togglePause', togglePause);
  
  var $team1 = $('#team1');
  var $team2 = $('#team2');

  var voteStats = [
    {
      $up: $('#stats-up1'),
      $none: $('#stats-none1'),
      $down: $('#stats-down1')
    },

    {
      $up: $('#stats-up2'),
      $none: $('#stats-none2'),
      $down: $('#stats-down2')
    }
  ]

  socket.on('playerCountTeam', function(data) {
    if (data.team == 0) {
      $team1.html(data.count);
    } else if (data.team == 1) {
      $team2.html(data.count);
    }
  });

  function getActionFromVotes(votes) {
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
  }

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

  socket.on('tick', function(votes) {
    pressedKeys = [];
    $('.winning-action').removeClass('winning-action');
    handleTick(0, votes[0]);
    handleTick(1, votes[1]);
  });

  function handleTick(team, votes) {
    var action = getActionFromVotes(votes);
    var sum = votes.up + votes.none + votes.down;
    var percentage;

    if (action != 'none') {
      var sum = votes.up + votes.down + votes.none;
      var percentage = sum ? votes[action] / sum - 0.5 : 0;
      console.log(percentage);
      if (team == activeTeams[0]) {
        p1.speed = percentage * 1000;
        console.log(p1.speed);
      } else if (team == activeTeams[1]) {
        p2.speed = percentage * 1000;
      }

      var key = actionToKeyCode(team, action);
      pressedKeys.push(key)
    }

    voteStats[team].$up.html(votes.up);
    voteStats[team].$none.html(votes.none);
    voteStats[team].$down.html(votes.down);
    voteStats[team]['$' + action].parent().addClass('winning-action');
  }

  this.isDown = function(keyCode) {
    return pressedKeys.indexOf(keyCode) != -1;
  };
});

function togglePause() {
  isGameStarted = false;
  window.manuallyStopped = !window.manuallyStopped;
  clearInterval(window.startInterval);
  window.startInterval = false;
}

$(document).on('keydown', function(e) {
  if (e.keyCode == 32) {
    togglePause();
  }
});