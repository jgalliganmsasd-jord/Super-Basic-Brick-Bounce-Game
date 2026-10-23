// ============================================================
// BLOCK BREAKER (base game)
//
// game.js  = the canvas, the ball, the paddle, and the game loop
// bricks.js     = where the bricks are and how they are drawn
// collisions.js = what happens when the ball touches things
// ============================================================

const GameState = {
  addedBallSpeed: 0,
  addedPaddleSpeed: 0
};

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;   // 600
const HEIGHT = canvas.height; // 450


// ------------------------------------------------------------
// THE BALL
// x and y are the top-left corner. vx and vy are how many pixels
// the ball moves each update (vx = sideways, vy = up/down).
// A positive vy means the ball is moving DOWN the screen.
// ------------------------------------------------------------
const BALL_SPEED = 4;

const ball = {
  x: 0,
  y: 0,
  width: 12,
  height: 12,
  vx: 0,
  vy: 0
};

// Put the ball in the center and reset its speed and direction.
function resetBall() {
  ball.x = WIDTH / 2 - ball.width / 2;
  ball.y = HEIGHT / 2 - ball.height / 2;
  ball.vx = 0;
  ball.vy = 0;
}

function launchBall() {
  if (ball.vx === 0 && ball.vy === 0) {
    ball.vx = BALL_SPEED + GameState.addedBallSpeed;  // right
    ball.vy = BALL_SPEED + GameState.addedBallSpeed;  // down
  }
}

function restartGame() {
  bricks = makeBricks();
  gameScore = 0;
  GameState.addedBallSpeed = 0;
  GameState.addedPaddleSpeed = 0;
  resetBall();
}


// ------------------------------------------------------------
// THE PADDLE
// ------------------------------------------------------------
const paddle = {
  x: WIDTH / 2 - 45,
  y: HEIGHT - 30,
  width: 90,
  height: 12,
  speed: 6
};

function widenPaddle() {
  const center = paddle.x + paddle.width / 2;
  paddle.width = Math.min(paddle.width + 20, WIDTH);
  paddle.x = Math.max(0, Math.min(WIDTH - paddle.width, center - paddle.width / 2));
}


// ------------------------------------------------------------
// THE BRICKS (the list is filled in by makeBricks() in bricks.js)
// ------------------------------------------------------------
let bricks = [];
let gameScore = 0;
let isPaused = false;

function pauseGame() {
  isPaused = !isPaused;
  if (isPaused) {
    Object.keys(keys).forEach(function (key) {
      keys[key] = false;
    });
  }
}


// ------------------------------------------------------------
// KEYBOARD
// keys["arrowleft"] is true while the left arrow is held down.
// ------------------------------------------------------------
const keys = {};

document.addEventListener("keydown", function (event) {
  keys[event.key.toLowerCase()] = true;
  if (event.code === "Space") {
    event.preventDefault();
    launchBall();
  }
  if (event.key.toLowerCase() === "p" && !event.repeat) {
    pauseGame();
  }
  if (event.key.toLowerCase() === "w" && !event.repeat) {
    widenPaddle();
  }
  if (event.key.toLowerCase() === "r") {
    restartGame();
  }
  // Stop the arrow keys from scrolling the page.
  if (event.key.startsWith("Arrow")) {
    event.preventDefault();
  }
});

document.addEventListener("keyup", function (event) {
  keys[event.key.toLowerCase()] = false;
});


// ------------------------------------------------------------
// UPDATE: runs 60 times every second. Move things, then check
// what they touched.
// ------------------------------------------------------------
function update() {
  movePaddle();
  moveBall();

  bounceOffWalls();   // collisions.js
  bounceOffPaddle();  // collisions.js
  const brokenBrick = bounceOffBricks();  // collisions.js
  if (brokenBrick) {
    GameState.addedBallSpeed += 0.25;
    GameState.addedPaddleSpeed += 0.25;
    ball.vx += Math.sign(ball.vx) * 0.25;
    ball.vy += Math.sign(ball.vy) * 0.25;
    scoreSystem(brokenBrick);
  }

  // The ball fell off the bottom: back to the center.
  if (ball.y > HEIGHT) {
    resetBall();
  }
}

function movePaddleLeft() {
  const paddleSpeed = paddle.speed + GameState.addedPaddleSpeed;
  paddle.x = paddle.x - paddleSpeed;

  // Keep the paddle on the screen.
  if (paddle.x < 0) {
    paddle.x = 0;
  }
}

function movePaddleRight() {
  const paddleSpeed = paddle.speed + GameState.addedPaddleSpeed;
  paddle.x = paddle.x + paddleSpeed;

  // Keep the paddle on the screen.
  if (paddle.x + paddle.width > WIDTH) {
    paddle.x = WIDTH - paddle.width;
  }
}

function movePaddle() {
  if (keys["arrowleft"] || keys["a"]) {
    movePaddleLeft();
  }
  if (keys["arrowright"] || keys["d"]) {
    movePaddleRight();
  }
}

function moveBall() {
  ball.x = ball.x + ball.vx;
  ball.y = ball.y + ball.vy;
}

function scoreSystem(brick) {
  gameScore += brick.score.value;
}


// ------------------------------------------------------------
// DRAW: paints everything on the canvas. Black background,
// white shapes.
// ------------------------------------------------------------
function draw() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = "white";
  ctx.font = "16px sans-serif";
  ctx.fillText("Score: " + gameScore, 10, 22);
  ctx.font = "12px sans-serif";
  ctx.fillText("Added ball speed: " + GameState.addedBallSpeed.toFixed(2), 250, 20);
  ctx.fillText("Added paddle speed: " + GameState.addedPaddleSpeed.toFixed(2), 250, 40);
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
  ctx.fillRect(ball.x, ball.y, ball.width, ball.height);

  drawBricks();  // bricks.js

  if (isPaused) {
    ctx.fillStyle = "white";
    ctx.font = "32px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Paused", WIDTH / 2, HEIGHT / 2);
    ctx.textAlign = "start";
  }
}


// ------------------------------------------------------------
// THE GAME LOOP
// The browser calls frame() every time it is ready to draw.
// Some screens are faster than others, so we make sure update()
// always runs exactly 60 times per second on every computer.
// ------------------------------------------------------------
const STEP = 1000 / 60;
let lastTime = 0;
let leftover = 0;

function frame(now) {
  if (isPaused) {
    lastTime = now;
    leftover = 0;
    draw();
    requestAnimationFrame(frame);
    return;
  }

  leftover = leftover + (now - lastTime);
  lastTime = now;

  // If the tab was hidden for a while, don't try to catch up.
  if (leftover > 250) {
    leftover = 250;
  }

  while (leftover >= STEP) {
    update();
    leftover = leftover - STEP;
  }

  draw();
  requestAnimationFrame(frame);
}

function start() {
  bricks = makeBricks();  // bricks.js
  gameScore = 0;
  resetBall();
  lastTime = performance.now();
  requestAnimationFrame(frame);
}

// Wait until all game scripts have loaded, then start.
window.addEventListener("load", start);
