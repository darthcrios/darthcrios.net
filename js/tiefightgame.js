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
    score: 0
};

let missiles = [];
let asteroids = [];
let keys = {};

function handleKeyDown(event) {
    keys[event.code] = true;
    if (event.code === "Space") fireMissile();
}

function handleKeyUp(event) {
    keys[event.code] = false;
}

function fireMissile() {
    missiles.push({
        x: player.x,
        y: player.y,
        angle: player.angle,
        speed: 5
    });
}

function update() {
    if (keys["ArrowLeft"]) player.angle -= 0.1;
    if (keys["ArrowRight"]) player.angle += 0.1;

    missiles.forEach(missile => {
        missile.x += Math.cos(missile.angle) * missile.speed;
        missile.y += Math.sin(missile.angle) * missile.speed;
    });

    asteroids.forEach(asteroid => {
        asteroid.x += Math.cos(asteroid.angle) * asteroid.speed;
        asteroid.y += Math.sin(asteroid.angle) * asteroid.speed;
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);
    ctx.fillStyle = "white";
    ctx.fillRect(-10, -10, 20, 20);
    ctx.restore();
    
    missiles.forEach(missile => {
        ctx.beginPath();
        ctx.arc(missile.x, missile.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = "red";
        ctx.fill();
    });
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
