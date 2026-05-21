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
// Store all rooms with their game states
let rooms = {};

function createRoomState(multiplier = 1) {
    return {
        speedMultiplier: multiplier,
        players: { player1: null, player2: null },
        gameState: {
            puck: { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2, vx: 3 * multiplier, vy: 2 * multiplier },
            player1: { x: 150, y: 300 },
            player2: { x: 650, y: 300 },
            scoreP1: 0,
            scoreP2: 0
        }
    };
}

io.on('connection', (socket) => {
    console.log(`Device connected: ${socket.id}`);

    socket.on('joinRoom', (roomCode) => {
        // Create room if it doesn't exist
        if (!rooms[roomCode]) {
            rooms[roomCode] = createRoomState();
            console.log(`Room ${roomCode} created`);
        }
        
        socket.join(roomCode);
        socket.roomCode = roomCode;
        socket.emit('roomJoined', roomCode);
        console.log(`${socket.id} joined room ${roomCode}`);
    });

    socket.on('requestHost', () => {
        const room = rooms[socket.roomCode];
        if (!room) {
            socket.emit('roleDenied', 'Join a room first!');
            return;
        }
        
        if (!room.players.player1) {
            room.players.player1 = socket.id;
            socket.emit('roleConfirmed', 'player1');
            console.log(`${socket.id} confirmed as Host (Player 1) in room ${socket.roomCode}`);
        } else {
            socket.emit('roleDenied', 'Host slot is already taken!');
        }
    });

    socket.on('requestJoin', () => {
        const room = rooms[socket.roomCode];
        if (!room) {
            socket.emit('roleDenied', 'Join a room first!');
            return;
        }
        
        if (!room.players.player2) {
            room.players.player2 = socket.id;
            socket.emit('roleConfirmed', 'player2');
            console.log(`${socket.id} confirmed as Joiner (Player 2) in room ${socket.roomCode}`);
        } else {
            socket.emit('roleDenied', 'Join slot is already taken!');
        }
    });

    socket.on('requestReset', () => {
        const room = rooms[socket.roomCode];
        if (!room) return;
        
        room.gameState = {
            puck: { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2, vx: 3 * room.speedMultiplier, vy: 2 * room.speedMultiplier },
            player1: { x: 150, y: 300 },
            player2: { x: 650, y: 300 },
            scoreP1: 0,
            scoreP2: 0
        };
        io.to(socket.roomCode).emit('gameStateUpdate', room.gameState);
    });

    socket.on('updateMallet', (data) => {
        const room = rooms[socket.roomCode];
        if (!room) return;
        
        if (socket.id === room.players.player1) {
            room.gameState.player1.x = Math.min(data.x, 525);
            room.gameState.player1.y = Math.max(PUCK_RADIUS, Math.min(data.y, GAME_HEIGHT - PUCK_RADIUS));
        } else if (socket.id === room.players.player2) {
            room.gameState.player2.x = Math.max(data.x, 555);
            room.gameState.player2.y = Math.max(PUCK_RADIUS, Math.min(data.y, GAME_HEIGHT - PUCK_RADIUS));
        }
    });

    socket.on('changeSpeedMultiplier', (newSpeed) => {
        const room = rooms[socket.roomCode];
        if (!room) return;
        
        if (newSpeed <= 0) return;
        
        room.speedMultiplier = newSpeed;
        room.gameState.puck.x = GAME_WIDTH / 2;
        room.gameState.puck.y = GAME_HEIGHT / 2;
        room.gameState.puck.vx = 3 * room.speedMultiplier;
        room.gameState.puck.vy = 2 * room.speedMultiplier;
        io.to(socket.roomCode).emit('gameStateUpdate', room.gameState);
        console.log(`Speed multiplier in room ${socket.roomCode} changed to: ${room.speedMultiplier}`);
    });

    socket.on('disconnect', () => {
        const room = rooms[socket.roomCode];
        if (room) {
            if (socket.id === room.players.player1) {
                room.players.player1 = null;
                console.log('Host disconnected from room ' + socket.roomCode);
            } else if (socket.id === room.players.player2) {
                room.players.player2 = null;
                console.log('Joiner disconnected from room ' + socket.roomCode);
            }
            
            // Delete room if empty
            if (!room.players.player1 && !room.players.player2) {
                delete rooms[socket.roomCode];
                console.log(`Room ${socket.roomCode} deleted`);
            }
        }
    });
});

function resetPuck(room) {
    room.gameState.puck = {
        x: GAME_WIDTH / 2,
        y: GAME_HEIGHT / 2,
        vx: 15 * room.speedMultiplier,
        vy: 15 * room.speedMultiplier
    };
}

function checkPaddleCollision(puck, paddle, isPlayer1, speedMultiplier) {
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

function checkGoal(room) {
    const puck = room.gameState.puck;
    const leftDistance = Math.sqrt((puck.x - LEFT_GOAL.x) ** 2 + (puck.y - LEFT_GOAL.y) ** 2);
    const rightDistance = Math.sqrt((puck.x - RIGHT_GOAL.x) ** 2 + (puck.y - RIGHT_GOAL.y) ** 2);

    if (leftDistance < GOAL_RADIUS) {
        room.gameState.scoreP2 += 1;
        resetPuck(room);
        return true;
    }

    if (rightDistance < GOAL_RADIUS) {
        room.gameState.scoreP1 += 1;
        resetPuck(room);
        return true;
    }

    return false;
}

setInterval(() => {
    // Update all active rooms
    for (let roomCode in rooms) {
        const room = rooms[roomCode];
        const puck = room.gameState.puck;
        
        puck.x += puck.vx;
        puck.y += puck.vy;

        checkPaddleCollision(puck, room.gameState.player1, true, room.speedMultiplier);
        checkPaddleCollision(puck, room.gameState.player2, false, room.speedMultiplier);

        if (checkGoal(room)) {
            io.to(roomCode).emit('gameStateUpdate', room.gameState);
            continue;
        }

        if (puck.x < PUCK_RADIUS || puck.x > GAME_WIDTH - PUCK_RADIUS) {
            puck.vx *= -1;
        }
        if (puck.y < PUCK_RADIUS || puck.y > GAME_HEIGHT - PUCK_RADIUS) {
            puck.vy *= -1;
        }

        io.to(roomCode).emit('gameStateUpdate', room.gameState);
    }
}, 1000 / 60);

http.listen(3000, '0.0.0.0', () => console.log('Server listening on port 3000'));
                           