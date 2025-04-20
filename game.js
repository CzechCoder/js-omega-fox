const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const VIRTUAL_WIDTH = 1280;
const VIRTUAL_HEIGHT = 720;

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Game variables
const keys = {};
const bullets = [];
const bulletSpeed = 10;
const shootCooldown = 200;
let canShoot = true;
let lastShotTime = 0;
let cameraX = 0;
let lastTime = 0;
let gameWon = false;

// Level
const level = [
  { x: 0, y: VIRTUAL_HEIGHT - 50, width: 3000, height: 50 }, // ground
  { x: 400, y: VIRTUAL_HEIGHT - 150, width: 200, height: 20 }, // platform
  { x: 800, y: VIRTUAL_HEIGHT - 250, width: 200, height: 20 },
  { x: 1200, y: VIRTUAL_HEIGHT - 350, width: 200, height: 20 },
  { x: 1600, y: VIRTUAL_HEIGHT - 200, width: 200, height: 20 },
];

const playerIdleImage = new Image();
playerIdleImage.src = "image/player.png";

const playerJumpImage = new Image();
playerJumpImage.src = "image/player_jump.png";

const treesImage = new Image();
treesImage.src = "image/bg_trees.png";

const finishFlagImage = new Image();
finishFlagImage.src = "image/finish_flag.png"; // Replace with your image path

// Tiles
const groundTile = new Image();
groundTile.src = "image/tile_ground.png";

const platformTile = new Image();
platformTile.src = "image/tile_platform.png";

const playerWalkImage = new Image();
playerWalkImage.src = "image/player_walk1.png";

const enemyImage = new Image();
enemyImage.src = "image/enemy_robot1.png";

// Player
const player = {
  x: 100,
  y: VIRTUAL_HEIGHT - 150,
  width: 205,
  height: 191,
  speed: 6,
  vy: 0,
  jumpForce: 19,
  gravity: 0.7,
  grounded: false,
  color: "#3ab0ff",
  facingLeft: false,
  image: playerIdleImage,
};

// Enemies
const enemy_type1 = {
  width: 180,
  height: 193,
};

const enemies = [
  {
    x: 500,
    y: VIRTUAL_HEIGHT - 242,
    ...enemy_type1,
    speed: 1, // Speed of enemy movement
    direction: 1, // 1 for moving right, -1 for moving left
    image: enemyImage,
  },
  {
    x: 1000,
    y: VIRTUAL_HEIGHT - 242,
    ...enemy_type1,
    speed: 1,
    direction: -1,
    image: enemyImage,
  },
  {
    x: 1300,
    y: VIRTUAL_HEIGHT - 242,
    ...enemy_type1,
    speed: 1,
    direction: -1,
    image: enemyImage,
  },
  {
    x: 1800,
    y: VIRTUAL_HEIGHT - 242,
    ...enemy_type1,
    speed: 1,
    direction: -1,
    image: enemyImage,
  },
];

const finishPoint = {
  x: 2800, // Change to your desired x-coordinate
  y: VIRTUAL_HEIGHT - 282, // Adjust to match the ground level
  width: 114, // Set the width of the flag image
  height: 235, // Set the height of the flag image
};

// Controls
window.addEventListener("keydown", (e) => {
  keys[e.key] = true;
  if (e.key === " ") {
    const now = Date.now();
    if (canShoot && now - lastShotTime >= shootCooldown) {
      shootBullet();
      lastShotTime = now;
      canShoot = false;

      // Re-enable shooting after cooldown
      setTimeout(() => {
        canShoot = true;
      }, shootCooldown);
    }
  }

  if (e.key === "r") {
    if (gameWon) {
      // Reset game variables
      gameWon = false;
      player.x = 100; // Reset player position
      player.y = VIRTUAL_HEIGHT - 150;
      player.vy = 0;
      player.image = playerIdleImage;
      // Reset other game state variables if necessary
      bullets.length = 0; // Clear bullets
      // Reload or reset level data if needed
    }
  }
});

window.addEventListener("keyup", (e) => (keys[e.key] = false));

// Functions

// Update enemies (simple walking back and forth)
function updateEnemies(deltaTime) {
  for (let enemy of enemies) {
    enemy.x += enemy.speed * enemy.direction * deltaTime * 60; // Move the enemy

    // Check for boundary and change direction
    if (enemy.x <= 0 || enemy.x + enemy.width >= VIRTUAL_WIDTH) {
      enemy.direction *= -1; // Reverse direction
    }
  }
}

// Shooting
function shootBullet() {
  bullets.push({
    x: player.facingLeft ? player.x - 10 : player.x + player.width - 10, // adjust origin based on facing
    y: player.y + player.height / 2 - 38,
    width: 20,
    height: 10,
    color: "orange",
    speed: bulletSpeed,
    direction: player.facingLeft ? -1 : 1, // NEW: direction
  });
}

// Is finish?
// Check if player reaches the finish point
function checkFinish() {
  const flagX = finishPoint.x;
  const flagY = finishPoint.y;
  const flagWidth = finishPoint.width;
  const flagHeight = finishPoint.height;

  if (
    player.x + player.width > flagX &&
    player.x < flagX + flagWidth &&
    player.y + player.height > flagY &&
    player.y < flagY + flagHeight
  ) {
    // Player has reached the finish point
    return true;
  }

  return false;
}

// Draw the pause menu
function drawGameOver() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)"; // Dark overlay
  ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
  ctx.fillStyle = "white"; // Text color
  ctx.font = "48px Arial";
  ctx.textAlign = "center";
  ctx.fillText(
    "You win! Press R to restart the game.",
    VIRTUAL_WIDTH / 2,
    VIRTUAL_HEIGHT / 2
  );
}

// Running mechanics
function update(deltaTime) {
  if (gameWon) {
    return;
  }

  // Center camera on player
  cameraX = player.x - VIRTUAL_WIDTH / 2;
  if (cameraX < 0) cameraX = 0;

  const moveSpeed = player.speed * deltaTime * 60;

  // Horizontal movement
  if (keys["ArrowLeft"]) {
    player.x -= moveSpeed;
    player.facingLeft = true;
  }
  if (keys["ArrowRight"]) {
    player.x += moveSpeed;
    player.facingLeft = false;
  }

  const isWalking = keys["ArrowLeft"] || keys["ArrowRight"];

  if (player.x < 0) player.x = 0; // Prevent going off screen

  // Jumping
  if (keys["ArrowUp"] && player.grounded) {
    player.vy = -player.jumpForce;
    player.grounded = false;

    for (let plat of level) {
      if (
        player.x < plat.x + plat.width &&
        player.x + player.width > plat.x &&
        player.y + player.height < plat.y + 10 &&
        player.y + player.height + player.vy >= plat.y
      ) {
        player.y = plat.y - player.height;
        player.vy = 0;
        player.grounded = true;
      }
    }
  }

  // Gravity
  player.vy += player.gravity * deltaTime * 60;
  player.y += player.vy * deltaTime * 60;

  player.grounded = false;

  // Platform collision
  for (let plat of level) {
    if (
      player.x < plat.x + plat.width &&
      player.x + player.width > plat.x &&
      player.y + player.height < plat.y + 10 &&
      player.y + player.height + player.vy >= plat.y
    ) {
      player.y = plat.y - player.height;
      player.vy = 0;
      player.grounded = true;
    }
  }

  // Ground collision
  if (player.y + player.height >= VIRTUAL_HEIGHT - 50) {
    player.y = VIRTUAL_HEIGHT - 50 - player.height;
    player.vy = 0;
    player.grounded = true;
  }

  // Update frame
  if (player.grounded && !isWalking) {
    player.image = playerIdleImage;
  } else if (player.grounded && isWalking) {
    player.image = playerWalkImage;
  } else if (!player.grounded) {
    player.image = playerJumpImage;
  }

  // Update bullets
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].x += bullets[i].speed * bullets[i].direction * deltaTime * 60;

    // Remove bullets that have left the visible screen (with camera)
    if (
      bullets[i].x - cameraX > VIRTUAL_WIDTH ||
      bullets[i].x + bullets[i].width < cameraX
    ) {
      bullets.splice(i, 1);
    }
  }

  updateEnemies(deltaTime);

  if (checkFinish()) {
    gameWon = true;
  }
}

function draw() {
  ctx.clearRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

  // Draw background
  ctx.fillStyle = "#a0d8f1"; // Light blue sky color
  ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

  ctx.drawImage(treesImage, -cameraX * 0.2, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

  ctx.save();
  ctx.translate(-cameraX, 0); // Apply camera scroll

  // Draw platforms
  level.forEach((plat) => {
    const tile = plat.height > 30 ? groundTile : platformTile;
    for (let x = 0; x < plat.width; x += tile.width) {
      ctx.drawImage(tile, plat.x + x, plat.y, tile.width, tile.height);
    }
  });

  // Draw player
  if (player.facingLeft) {
    ctx.save();
    ctx.scale(-1, 1); // flip horizontally
    ctx.drawImage(
      player.image,
      -player.x - player.width, // flip x-pos
      player.y,
      player.width,
      player.height
    );
    ctx.restore();
  } else {
    ctx.drawImage(
      player.image,
      player.x,
      player.y,
      player.width,
      player.height
    );
  }

  // Draw enemies
  enemies.forEach((enemy) => {
    ctx.drawImage(enemy.image, enemy.x, enemy.y, enemy.width, enemy.height);
    // Log the position of enemies to check if they are visible
    console.log(`Enemy at: (${enemy.x}, ${enemy.y})`);
  });

  // Draw finish line
  ctx.drawImage(
    finishFlagImage,
    finishPoint.x,
    finishPoint.y,
    finishPoint.width,
    finishPoint.height
  );

  // Draw bullets
  bullets.forEach((b) => {
    ctx.fillStyle = b.color;
    ctx.fillRect(b.x, b.y, b.width, b.height);
  });

  ctx.restore();
}

function gameLoop(currentTime) {
  const deltaTime = (currentTime - lastTime) / 1000; // convert ms to seconds
  lastTime = currentTime;

  update(deltaTime);
  draw();

  if (gameWon) drawGameOver();

  requestAnimationFrame(gameLoop);
}

player.image.onload = () => requestAnimationFrame(gameLoop); // Start game only when image is ready

function resizeCanvas() {
  const aspect = 16 / 9;
  let width = window.innerWidth;
  let height = window.innerHeight;

  if (width / height > aspect) {
    width = height * aspect;
  } else {
    height = width / aspect;
  }

  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  canvas.width = VIRTUAL_WIDTH;
  canvas.height = VIRTUAL_HEIGHT;
}
