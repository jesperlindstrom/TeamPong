var proxy = new (function() {
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

  this.isDown = function(keyCode) {
    if (keyCode == keys.P1.DOWN)
      return true;

    return false;
  };

  this.isUp = function(keyCode) {

  };
});