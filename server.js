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

// Physics and sync ticker (60 FPS)
setInterval(() => {
    gameState.puck.x += gameState.puck.vx;
    gameState.puck.y += gameState.puck.vy;
    
    if (gameState.puck.x < 15 || gameState.puck.x > 785) gameState.puck.vx *= -1;
    if (gameState.puck.y < 15 || gameState.puck.y > 585) gameState.puck.vy *= -1;

    io.emit('gameStateUpdate', gameState);
}, 1000 / 60);

http.listen(3000, '0.0.0.0', () => console.log('Server listening on port 3000'));