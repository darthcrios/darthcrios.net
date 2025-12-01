const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 600;
canvas.height = 600;

document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);

let player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    angle: 0,
    size: 20,
    speed: 2,
    score: 0
};

let missiles = [];
let asteroids = [];
let keys = {};
let gameOver = false;

function handleKeyDown(event) {
    keys[event.code] = true;
    if (event.code === "Space") fireMissile();
}

function handleKeyUp(event) {
    keys[event.code] = false;
}

function fireMissile() {
    if (gameOver) return;  // Prevent firing if the game is over
    missiles.push({
        x: player.x,
        y: player.y,
        angle: player.angle,
        speed: 5
    });
}

function spawnAsteroid() {
    const size = Math.random() * 30 + 20;
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 1 + 1;

    asteroids.push({
        x: x,
        y: y,
        size: size,
        angle: angle,
        speed: speed
    });
}

function update() {
    if (gameOver) return;

    if (keys["ArrowLeft"]) player.angle -= 0.1;
    if (keys["ArrowRight"]) player.angle += 0.1;

    if (keys["ArrowUp"]) {
        player.x += Math.cos(player.angle) * player.speed;
        player.y += Math.sin(player.angle) * player.speed;
    }

    if (keys["ArrowDown"]) {
        player.x -= Math.cos(player.angle) * player.speed;
        player.y -= Math.sin(player.angle) * player.speed;
    }

    missiles.forEach((missile, index) => {
        missile.x += Math.cos(missile.angle) * missile.speed;
        missile.y += Math.sin(missile.angle) * missile.speed;

        // Remove missiles that go out of bounds
        if (missile.x < 0 || missile.x > canvas.width || missile.y < 0 || missile.y > canvas.height) {
            missiles.splice(index, 1);
        }
    });

    asteroids.forEach((asteroid, index) => {
        asteroid.x += Math.cos(asteroid.angle) * asteroid.speed;
        asteroid.y += Math.sin(asteroid.angle) * asteroid.speed;

        // Wrap around the screen
        if (asteroid.x < 0) asteroid.x = canvas.width;
        if (asteroid.x > canvas.width) asteroid.x = 0;
        if (asteroid.y < 0) asteroid.y = canvas.height;
        if (asteroid.y > canvas.height) asteroid.y = 0;

        // Check for collisions with missiles
        missiles.forEach((missile, missileIndex) => {
            const dx = missile.x - asteroid.x;
            const dy = missile.y - asteroid.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < asteroid.size / 2 + 3) {  // Collision detection
                // Remove asteroid and missile
                asteroids.splice(index, 1);
                missiles.splice(missileIndex, 1);
                player.score += 10;  // Increase score
            }
        });

        // Check for collision with player
        const dx = player.x - asteroid.x;
        const dy = player.y - asteroid.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < player.size / 2 + asteroid.size / 2) {
            gameOver = true;  // Game over if player collides with asteroid
        }
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameOver) {
        ctx.fillStyle = "white";
        ctx.font = "30px Arial";
        ctx.fillText("Game Over", canvas.width / 2 - 80, canvas.height / 2);
        ctx.fillText("Score: " + player.score, canvas.width / 2 - 60, canvas.height / 2 + 40);
        return;
    }

    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);
    ctx.fillStyle = "white";
    ctx.fillRect(-10, -10, 20, 20);  // Player is a square
    ctx.restore();

    missiles.forEach(missile => {
        ctx.beginPath();
        ctx.arc(missile.x, missile.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = "red";
        ctx.fill();
    });

    asteroids.forEach(asteroid => {
        ctx.beginPath();
        ctx.arc(asteroid.x, asteroid.y, asteroid.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = "gray";
        ctx.fill();
    });

    // Draw score
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + player.score, 10, 20);
}

function gameLoop() {
    if (!gameOver) {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }
}

// Spawn asteroids at regular intervals
setInterval(() => {
    if (!gameOver) spawnAsteroid();
}, 2000);  // Spawn every 2 seconds

gameLoop();
