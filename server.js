const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

const GAME_WIDTH = 1080;
const GAME_HEIGHT = 720;
const PUCK_RADIUS = 30;
const PADDLE_RADIUS = 45;
const GOAL_RADIUS = 65;
const LEFT_GOAL = { x: 0, y: GAME_HEIGHT / 2 };
const RIGHT_GOAL = { x: GAME_WIDTH, y: GAME_HEIGHT / 2 };
let speedMultiplier = 1;

let players = {
    player1: null,
    player2: null
};

let gameState = {
    puck: { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2, vx: 3 * speedMultiplier, vy: 2 * speedMultiplier },
    player1: { x: 150, y: 300 },
    player2: { x: 650, y: 300 },
    scoreP1: 0,
    scoreP2: 0
};

io.on('connection', (socket) => {
    console.log(`Device connected: ${socket.id}`);

    socket.on('requestHost', () => {
        if (!players.player1) {
            players.player1 = socket.id;
            socket.emit('roleConfirmed', 'player1');
            console.log(`${socket.id} confirmed as Host (Player 1)`);
        } else {
            socket.emit('roleDenied', 'Host slot is already taken!');
        }
    });

    socket.on('requestJoin', () => {
        if (!players.player2) {
            players.player2 = socket.id;
            socket.emit('roleConfirmed', 'player2');
            console.log(`${socket.id} confirmed as Joiner (Player 2)`);
        } else {
            socket.emit('roleDenied', 'Join slot is already taken!');
        }
    });

    socket.on('requestReset', () => {
        gameState = {
            puck: { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2, vx: 3 * speedMultiplier, vy: 2 * speedMultiplier },
            player1: { x: 150, y: 300 },
            player2: { x: 650, y: 300 },
            scoreP1: 0,
            scoreP2: 0
        };
        io.emit('gameStateUpdate', gameState);
    });

    socket.on('updateMallet', (data) => {
        if (socket.id === players.player1) {
            gameState.player1.x = Math.min(data.x, 525);
            gameState.player1.y = Math.max(PUCK_RADIUS, Math.min(data.y, GAME_HEIGHT - PUCK_RADIUS));
        } else if (socket.id === players.player2) {
            gameState.player2.x = Math.max(data.x, 555);
            gameState.player2.y = Math.max(PUCK_RADIUS, Math.min(data.y, GAME_HEIGHT - PUCK_RADIUS));
        }
    });

    socket.on('changeSpeedMultiplier', (newSpeed) => {
        console.log('Received changeSpeedMultiplier event with value:', newSpeed);
        if (newSpeed <= 0) {
            console.log('Invalid speed multiplier');
            return;
        }
        speedMultiplier = newSpeed;
        console.log('Updated speedMultiplier to:', speedMultiplier);
        // Reset puck with new speed
        gameState.puck.x = GAME_WIDTH / 2;
        gameState.puck.y = GAME_HEIGHT / 2;
        gameState.puck.vx = 3 * speedMultiplier;
        gameState.puck.vy = 2 * speedMultiplier;
        io.emit('gameStateUpdate', gameState);
        console.log('Puck velocity updated to:', gameState.puck.vx, gameState.puck.vy);
    });

    socket.on('disconnect', () => {
        if (socket.id === players.player1) {
            players.player1 = null;
            console.log('Host disconnected');
        } else if (socket.id === players.player2) {
            players.player2 = null;
            console.log('Joiner disconnected');
        }
    });
});

function resetPuck() {
    gameState.puck = {
        x: GAME_WIDTH / 2,
        y: GAME_HEIGHT / 2,
        vx: 15 * speedMultiplier,
        vy: 15 * speedMultiplier
    };
}

function checkPaddleCollision(puck, paddle, isPlayer1) {
    const dx = puck.x - paddle.x;
    const dy = puck.y - paddle.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = PUCK_RADIUS + PADDLE_RADIUS;

    if (distance < minDistance) {
        const nx = dx / distance;
        const ny = dy / distance;
        const baseSpeed = 7 * speedMultiplier;

        puck.vx = nx * baseSpeed;
        puck.vy = ny * 5 * speedMultiplier + (dy > 0 ? 1 : -1);
        puck.x = paddle.x + nx * minDistance;
        puck.y = paddle.y + ny * minDistance;

        return true;
    }
    return false;
}

function checkGoal() {
    const puck = gameState.puck;
    const leftDistance = Math.sqrt((puck.x - LEFT_GOAL.x) ** 2 + (puck.y - LEFT_GOAL.y) ** 2);
    const rightDistance = Math.sqrt((puck.x - RIGHT_GOAL.x) ** 2 + (puck.y - RIGHT_GOAL.y) ** 2);

    if (leftDistance < GOAL_RADIUS) {
        gameState.scoreP2 += 1;
        resetPuck();
        return true;
    }

    if (rightDistance < GOAL_RADIUS) {
        gameState.scoreP1 += 1;
        resetPuck();
        return true;
    }

    return false;
}

setInterval(() => {
    gameState.puck.x += gameState.puck.vx;
    gameState.puck.y += gameState.puck.vy;

    checkPaddleCollision(gameState.puck, gameState.player1, true);
    checkPaddleCollision(gameState.puck, gameState.player2, false);

    if (checkGoal()) {
        io.emit('gameStateUpdate', gameState);
        return;
    }

    if (gameState.puck.x < PUCK_RADIUS || gameState.puck.x > GAME_WIDTH - PUCK_RADIUS) {
        gameState.puck.vx *= -1;
    }
    if (gameState.puck.y < PUCK_RADIUS || gameState.puck.y > GAME_HEIGHT - PUCK_RADIUS) {
        gameState.puck.vy *= -1;
    }

    io.emit('gameStateUpdate', gameState);
}, 1000 / 60);

http.listen(3000, '0.0.0.0', () => console.log('Server listening on port 3000'));
                           