// Draw everything
var render = function () {

  // Draw the background image
  ctx.fillStyle = bgPattern;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // ball
  if (ballBgImage.loaded) {
    ctx.drawImage(ballBgImage, ball.x, ball.y);
  }

  p1.render();
  p2.render();

  // Text options
  ctx.fillStyle = "rgb(250, 250, 250)";
  ctx.font = "50px Helvetica";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  // P1 Score
  ctx.fillText(p1.score, 32, 32);

  // P2 Score
  ctx.fillText(p2.score, canvas.width - 32 - 10, 32);

  // Text options
  ctx.font = "36px Helvetica";

  // Initial text
  if (!isGameStarted) {
    if (!window.startInterval && !window.manuallyStopped) {
      window.startWhenZero = 5;
      window.startInterval = setInterval(function() {
        window.startWhenZero--;

        if (window.startWhenZero == 0) {
          clearInterval(window.startInterval);
          window.startInterval = false;
          isGameStarted = true;
        }

      }, 1000);
    }

    if (window.manuallyStopped) {
      ctx.fillText("Paused", 320, canvas.height / 2 + 50);
      ctx.fillText("Press space to resume", 200, canvas.height / 2 + 100);
    } else {
      ctx.fillText("Starting in " + window.startWhenZero, 270, canvas.height / 2 + 50);
      ctx.fillText("Press space to pause", 200, canvas.height / 2 + 100);
    }
  }
};
