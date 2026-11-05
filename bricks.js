// ============================================================
// bricks.js: where the bricks are, and how they are drawn
// ============================================================

const BRICK_COLUMNS = 8;
const BRICK_ROWS = 4;
const BRICK_WIDTH = 60;
const BRICK_HEIGHT = 20;
const BRICK_GAP = 6;     // empty space between bricks
const BRICKS_TOP = 50;   // how far down the first row starts

const BRICK_TYPES = {
  default: { color: "white", hits: 1 },
  newbrick: { color: "#ff3333", hits: 3 }
};
const BRICK_SCORE_VALUE = 10;

function stayStill(brick) {}

function slide(brick) {
  brick.x += brick.speed;
  if (Math.abs(brick.x - brick.startX) > 30) {
    brick.speed *= -1;
  }
}

function makeBrick(x, y, type = "default", move = stayStill, speed = 0) {
  const definition = BRICK_TYPES[type] || BRICK_TYPES.default;

  return {
    x,
    startX: x,
    y,
    move,
    speed,
    width: BRICK_WIDTH,
    height: BRICK_HEIGHT,
    type,
    color: definition.color,
    hits: definition.hits,
    score: { value: BRICK_SCORE_VALUE }
  };
}

// Builds the list of bricks. Each brick is an object with an
// x, y, width, and height.
function makeBricks() {
  const list = [];

  // Center the whole block of bricks on the screen.
  const totalWidth = BRICK_COLUMNS * BRICK_WIDTH + (BRICK_COLUMNS - 1) * BRICK_GAP;
  const left = (WIDTH - totalWidth) / 2;

  for (let row = 0; row < BRICK_ROWS; row++) {
    for (let col = 0; col < BRICK_COLUMNS; col++) {
      //the line below this one controls WHERE the newbricks are made
      // row === 0 && col === 1 means that the new brick is ONLY in 0,1
      // && means and, it means BOTH must be true
      // || means OR, it means EITHER can be true
      const type = row === 0 || col === 0 ? "newbrick" : "default";
      list.push(makeBrick(
        left + col * (BRICK_WIDTH + BRICK_GAP),
        BRICKS_TOP + row * (BRICK_HEIGHT + BRICK_GAP),
        type,
        row === 0 ? slide : stayStill,
        row === 0 ? 2 : 0
      ));
    }
  }

  return list;
}

// Draws every brick in the list.
function drawBricks() {
  for (const brick of bricks) {
    ctx.fillStyle = brick.color;
    ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
  }
}
