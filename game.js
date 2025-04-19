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

// Player
const player = {
  x: 100,
  y: VIRTUAL_HEIGHT - 150,
  width: 205,
  height: 191,
  speed: 4,
  vy: 0,
  jumpForce: 15,
  gravity: 0.8,
  grounded: false,
  color: "#3ab0ff",
};

const playerImage = new Image();
playerImage.src = "image/player.png"; // Replace with your actual file name

// Controls
window.addEventListener("keydown", (e) => {
  keys[e.key] = true;
  if (e.key === " ") {
    shootBullet();
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
function update() {
  // Horizontal movement
  if (keys["ArrowLeft"] || keys["a"]) {
    player.x -= player.speed;
  }
  if (keys["ArrowRight"] || keys["d"]) {
    player.x += player.speed;
  }

  // Jumping
  if (keys["ArrowUp"] && player.grounded) {
    player.vy = -player.jumpForce;
    player.grounded = false;
  }

  // Gravity
  player.vy += player.gravity;
  player.y += player.vy;

  // Ground collision
  if (player.y + player.height >= VIRTUAL_HEIGHT - 50) {
    player.y = VIRTUAL_HEIGHT - 50 - player.height;
    player.vy = 0;
    player.grounded = true;
  }

  // Update bullets
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].x += bullets[i].speed;

    // Remove bullets off-screen
    if (bullets[i].x > VIRTUAL_WIDTH) {
      bullets.splice(i, 1);
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

  // Draw ground
  ctx.fillStyle = "#444";
  ctx.fillRect(0, VIRTUAL_HEIGHT - 50, VIRTUAL_WIDTH, 50);

  // Draw player
  ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);

  // Draw bullets
  bullets.forEach((b) => {
    ctx.fillStyle = b.color;
    ctx.fillRect(b.x, b.y, b.width, b.height);
  });
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

playerImage.onload = () => {
  gameLoop(); // Start game only when image is ready
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
