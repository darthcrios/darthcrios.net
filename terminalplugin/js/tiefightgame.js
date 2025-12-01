// PREVENT browser scrolling
window.addEventListener("keydown", e => {
    const blockKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"];
    if (blockKeys.includes(e.code)) e.preventDefault();
}, { passive: false });

// CANVAS
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 600;
canvas.height = 600;

// SOUNDS
const soundFire = new Audio("sounds/fire.wav");
const soundExplosion = new Audio("sounds/explosion.wav");
const soundThrust = new Audio("sounds/thrust.wav");
const unlockedTrack = new Audio("sounds/unlockedTrack.mp3");

unlockedTrack.loop = true; // optional

// PLAYER
let player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    angle: 0,
    size: 20,
    speed: 0,
    rotationSpeed: 0.07,
    maxSpeed: 3,
    score: 0,
    thrusting: false,
    lives: 3
};

let missiles = [];
let asteroids = [];
let keys = {};
let gameOver = false;
let winGame = false;
let difficulty = 1;

// INPUT
document.addEventListener("keydown", e => {
    keys[e.code] = true;

    if (!gameOver && !winGame && e.code === "Space") fireMissile();

    if ((gameOver || winGame) && e.code === "Space") restartGame();
});

document.addEventListener("keyup", e => keys[e.code] = false);

// FIRE MISSILE
function fireMissile() {
    soundFire.currentTime = 0;
    soundFire.play();

    missiles.push({
        x: player.x,
        y: player.y,
        angle: player.angle,
        speed: 6
    });
}

// SPAWN ASTEROIDS
function spawnAsteroid() {
    if (gameOver || winGame) return;

    const size = Math.random() * 40 + 30;
    const speed = Math.random() * 1.5 + difficulty;

    const edges = ["top", "bottom", "left", "right"];
    const edge = edges[Math.floor(Math.random() * edges.length)];

    let x, y;
    if (edge === "top") { x = Math.random() * canvas.width; y = 0; }
    if (edge === "bottom") { x = Math.random() * canvas.width; y = canvas.height; }
    if (edge === "left") { x = 0; y = Math.random() * canvas.height; }
    if (edge === "right") { x = canvas.width; y = Math.random() * canvas.height; }

    const angle = Math.atan2(player.y - y, player.x - x);

    asteroids.push({ x, y, size, angle, speed });
}

// EXPLOSION EFFECT
function drawExplosion(x, y) {
    for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.arc(
            x + Math.random() * 20 - 10,
            y + Math.random() * 20 - 10,
            Math.random() * 5 + 2,
            0,
            Math.PI * 2
        );
        ctx.fillStyle = ["orange", "yellow", "red"][Math.floor(Math.random() * 3)];
        ctx.fill();
    }
}

// UPDATE
function update() {
    if (gameOver || winGame) return;

    // WIN CONDITION
    if (player.score >= 100 && !winGame) {
        winGame = true;
        unlockedTrack.play();
        return;
    }

    // ROTATE
    if (keys["ArrowLeft"]) player.angle -= player.rotationSpeed;
    if (keys["ArrowRight"]) player.angle += player.rotationSpeed;

    // THRUST
    if (keys["ArrowUp"]) {
        player.speed = Math.min(player.speed + 0.1, player.maxSpeed);
        player.thrusting = true;
        soundThrust.play();
    } else {
        player.speed *= 0.98;
        player.thrusting = false;
        soundThrust.pause();
    }

    // MOVE PLAYER
    player.x += Math.cos(player.angle) * player.speed;
    player.y += Math.sin(player.angle) * player.speed;

    // WRAP PLAYER
    if (player.x < 0) player.x = canvas.width;
    if (player.x > canvas.width) player.x = 0;
    if (player.y < 0) player.y = canvas.height;
    if (player.y > canvas.height) player.y = 0;

    // MISSILES
    missiles.forEach((m, i) => {
        m.x += Math.cos(m.angle) * m.speed;
        m.y += Math.sin(m.angle) * m.speed;

        if (m.x < 0 || m.x > canvas.width || m.y < 0 || m.y > canvas.height)
            missiles.splice(i, 1);
    });

    // ASTEROIDS
    asteroids.forEach((a, ai) => {
        a.x += Math.cos(a.angle) * a.speed;
        a.y += Math.sin(a.angle) * a.speed;

        // WRAP asteroid
        if (a.x < 0) a.x = canvas.width;
        if (a.x > canvas.width) a.x = 0;
        if (a.y < 0) a.y = canvas.height;
        if (a.y > canvas.height) a.y = 0;

        // MISSILE HIT
        missiles.forEach((m, mi) => {
            const dx = m.x - a.x;
            const dy = m.y - a.y;
            if (Math.hypot(dx, dy) < a.size / 2) {
                drawExplosion(a.x, a.y);
                soundExplosion.currentTime = 0;
                soundExplosion.play();
                missiles.splice(mi, 1);
                asteroids.splice(ai, 1);
                player.score += 20;
            }
        });

        // PLAYER HIT
        const dx = player.x - a.x;
        const dy = player.y - a.y;
        if (Math.hypot(dx, dy) < player.size + a.size / 2) {
            asteroids.splice(ai, 1);
            player.lives--;

            if (player.lives <= 0) {
                gameOver = true;
            }
        }
    });

    // Difficulty increase
    difficulty += 0.0005;
}

// DRAW
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // WIN SCREEN
    if (winGame) {
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.font = "40px Arial";
        ctx.fillText("YOU WIN!", canvas.width / 2, canvas.height / 2);
        ctx.font = "22px Arial";
        ctx.fillText("Unlocked Track Playing…", canvas.width / 2, canvas.height / 2 + 40);
        ctx.fillText("Press SPACE to Restart", canvas.width / 2, canvas.height / 2 + 80);
        return;
    }

    // GAME OVER SCREEN
    if (gameOver) {
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.font = "40px Arial";
        ctx.fillText("GAME OVER", canvas.width/2, canvas.height/2);
        ctx.font = "24px Arial";
        ctx.fillText("Score: " + player.score, canvas.width/2, canvas.height/2 + 40);
        ctx.fillText("Press SPACE to Restart", canvas.width/2, canvas.height/2 + 80);
        return;
    }

    // PLAYER SHIP
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);

    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.moveTo(20, 0);
    ctx.lineTo(-15, -12);
    ctx.lineTo(-15, 12);
    ctx.closePath();
    ctx.fill();

    // THRUSTER FLAME
    if (player.thrusting) {
        ctx.beginPath();
        ctx.moveTo(-18, 0);
        ctx.lineTo(-32, -8);
        ctx.lineTo(-32, 8);
        ctx.fillStyle = "orange";
        ctx.fill();
    }

    ctx.restore();

    // MISSILES
    missiles.forEach(m => {
        ctx.beginPath();
        ctx.arc(m.x, m.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = "red";
        ctx.fill();
    });

    // ASTEROIDS
    asteroids.forEach(a => {
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = "gray";
        ctx.fill();
    });

    // SCORE 
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + player.score, 10, 25);

    // LIVES
    ctx.font = "20px Arial";
    ctx.fillText("Lives: " + "❤".repeat(player.lives), canvas.width - 10, 25);
;
}

// GAME LOOP
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function restartGame() {
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    player.speed = 0;
    player.angle = 0;
    player.score = 0;
    player.lives = 3;

    missiles = [];
    asteroids = [];
    difficulty = 1;

    gameOver = false;
    winGame = false;

    unlockedTrack.pause();
    unlockedTrack.currentTime = 0;
}

setInterval(spawnAsteroid, 1500);

gameLoop();

