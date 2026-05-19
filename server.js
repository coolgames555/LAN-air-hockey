const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

let players = {
    player1: null, // Stores socket.id of the Host
    player2: null  // Stores socket.id of the Joiner
};

let gameState = {
    puck: { x: 400, y: 300, vx: 3, vy: 2 },
    player1: { x: 150, y: 300 },
    player2: { x: 650, y: 300 }
};

io.on('connection', (socket) => {
    console.log(`Device connected: ${socket.id}`);

    // Player clicks "Host"
    socket.on('requestHost', () => {
        if (!players.player1) {
            players.player1 = socket.id;
            socket.emit('roleConfirmed', 'player1');
            console.log(`${socket.id} confirmed as Host (Player 1)`);
        } else {
            socket.emit('roleDenied', 'Host slot is already taken!');
        }
    });

    // Player clicks "Join"
    socket.on('requestJoin', () => {
        if (!players.player2) {
            players.player2 = socket.id;
            socket.emit('roleConfirmed', 'player2');
            console.log(`${socket.id} confirmed as Joiner (Player 2)`);
        } else {
            socket.emit('roleDenied', 'Join slot is already taken!');
        }
    });

    // Handle game controller coordinates
    socket.on('updateMallet', (data) => {
        if (socket.id === players.player1) {
            gameState.player1.x = Math.min(data.x, 370);
            gameState.player1.y = data.y;
        } else if (socket.id === players.player2) {
            gameState.player2.x = Math.max(data.x, 430);
            gameState.player2.y = data.y;
        }
    });

    // Clean up if a player drops out
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

// Helper function for paddle collision detection
function checkPaddleCollision(puck, paddle, isPlayer1) {
    const puckRadius = 15;
    const paddleRadius = 30;
    const dx = puck.x - paddle.x;
    const dy = puck.y - paddle.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = puckRadius + paddleRadius;
    
    // Only check collision if puck is moving toward the paddle
    const movingTowardPaddle = isPlayer1 ? puck.vx < 0 : puck.vx > 0;
    
    if (distance < minDistance && movingTowardPaddle) {
        // Collision detected
        // Normalize the collision vector
        const nx = dx / distance;
        const ny = dy / distance;
        
        // Bounce the puck away from the paddle with enhanced speed
        puck.vx = nx * 7; // increased speed on paddle hit
        puck.vy = ny * 5 + (dy > 0 ? 1 : -1); // add spin based on paddle position
        
        // Move puck outside collision radius to prevent overlap
        puck.x = paddle.x + nx * minDistance;
        puck.y = paddle.y + ny * minDistance;
        
        return true;
    }
    return false;
}

// Physics and sync ticker (60 FPS)
setInterval(() => {
    gameState.puck.x += gameState.puck.vx;
    gameState.puck.y += gameState.puck.vy;
    
    // Check paddle collisions
    checkPaddleCollision(gameState.puck, gameState.player1, true);
    checkPaddleCollision(gameState.puck, gameState.player2, false);
    
    // Wall bouncing
    if (gameState.puck.x < 15 || gameState.puck.x > 1065) gameState.puck.vx *= -1;
    if (gameState.puck.y < 15 || gameState.puck.y > 705) gameState.puck.vy *= -1;

    io.emit('gameStateUpdate', gameState);
}, 1000 / 60);

http.listen(3000, '0.0.0.0', () => console.log('Server listening on port 3000'));