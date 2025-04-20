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

// Level
const level = [
  { x: 0, y: VIRTUAL_HEIGHT - 50, width: 2000, height: 50 }, // ground
  { x: 400, y: VIRTUAL_HEIGHT - 150, width: 200, height: 20 }, // platform
  { x: 800, y: VIRTUAL_HEIGHT - 250, width: 200, height: 20 },
  { x: 1200, y: VIRTUAL_HEIGHT - 350, width: 200, height: 20 },
];

// Player
const player = {
  x: 100,
  y: VIRTUAL_HEIGHT - 150,
  width: 205,
  height: 191,
  speed: 4,
  vy: 0,
  jumpForce: 15,
  gravity: 0.6,
  grounded: false,
  color: "#3ab0ff",
};

const playerImage = new Image();
playerImage.src = "image/player.png";

const playerJumpImage = new Image();
playerJumpImage.src = "image/player_jump.png";

const treesImage = new Image();
treesImage.src = "image/bg_trees.png";

// Tiles
const groundTile = new Image();
groundTile.src = "image/tile_ground.png";

const platformTile = new Image();
platformTile.src = "image/tile_platform.png";

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
});

window.addEventListener("keyup", (e) => (keys[e.key] = false));

// Functions
function shootBullet() {
  bullets.push({
    x: player.x + player.width - 10, // from near the gun
    y: player.y + player.height / 2 - 38,
    width: 20,
    height: 10,
    color: "orange",
    speed: bulletSpeed,
  });
}

// Running mechanics
function update(deltaTime) {
  // Center camera on player
  cameraX = player.x - VIRTUAL_WIDTH / 2;
  if (cameraX < 0) cameraX = 0;

  const moveSpeed = player.speed * deltaTime * 60;

  // Horizontal movement
  if (keys["ArrowLeft"]) {
    player.x -= moveSpeed;
  }
  if (keys["ArrowRight"]) {
    player.x += moveSpeed;
  }
  if (player.x < 0) player.x = 0; // Prevent going off screen

  // Jumping
  if (keys["ArrowUp"] && player.grounded) {
    player.vy = -player.jumpForce;
    player.grounded = false;
    playerImage.src = playerJumpImage.src; // Change to jump image

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

  // Update bullets
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].x += bullets[i].speed * deltaTime * 60;

    // Remove bullets that have left the visible screen (with camera)
    if (
      bullets[i].x - cameraX > VIRTUAL_WIDTH ||
      bullets[i].x + bullets[i].width < cameraX
    ) {
      bullets.splice(i, 1);
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

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
  ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);

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

  requestAnimationFrame(gameLoop);
}

playerImage.onload = () => {
  requestAnimationFrame(gameLoop); // Start game only when image is ready
};

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
