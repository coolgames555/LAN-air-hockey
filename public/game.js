const socket = io();
const canvas = document.getElementById('rink');
const ctx = canvas.getContext('2d');

const paddle1Img = new Image();
const paddle2Img = new Image();
const puckImg = new Image();

paddle1Img.src = 'bluePaddle.png';
paddle2Img.src = 'redPaddle.png';
puckImg.src = 'puck.png';

const paddleSize = 90;
const puckSize = 45;

const menuDiv = document.getElementById('menu');
const gameContainer = document.getElementById('gameContainer');
const errorMsg = document.getElementById('menuError');
const statusText = document.getElementById('status');
const scoreBoard = document.getElementById('scoreBoard');

let myRole = 'spectator';
let gx1 = 0;
let gy1 = 360;
let gx2 = 1080;
let gy2 = 360;

// ----UI Interaction Hooks----
document.getElementById('hostBtn').addEventListener('click', () => {
    socket.emit('requestHost');
});

document.getElementById('joinBtn').addEventListener('click', () => {
    socket.emit('requestJoin');
});
document.getElementById('resetBtn').addEventListener('click', () => {
    socket.emit('requestReset');
});

// --- Server Confirmation Responses ---
socket.on('roleConfirmed', (role) => {
    myRole = role;
    
    // Swap screen layouts
    menuDiv.style.display = 'none';
    gameContainer.style.display = 'block';
    statusText.innerText = `Role: ${role.toUpperCase()}`;
});

socket.on('roleDenied', (reason) => {
    errorMsg.innerText = reason;
});

// --- Game Render Loop ---
socket.on('gameStateUpdate', (state) => {
    // Only bother drawing if the user has advanced past the menu screen
    if (gameContainer.style.display !== 'block') return;

    scoreBoard.textContent = `${state.scoreP1} - ${state.scoreP2}`;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    
    // Draw Blue Mallet (Host)
    if (paddle1Img.complete && paddle1Img.naturalWidth !== 0) {
        ctx.drawImage(
            paddle1Img,
            state.player1.x - paddleSize / 2,
            state.player1.y - paddleSize / 2,
            paddleSize,
            paddleSize
        );
    } else {
        ctx.fillStyle = '#0055ff';
        ctx.beginPath();
        ctx.arc(state.player1.x, state.player1.y, paddleSize / 2, 0, Math.PI * 2);
        ctx.fill();
    }

    // Draw Goal for Player 1
    ctx.fillStyle = '#0055ff';
    ctx.beginPath();
    ctx.arc(gx1, gy1, 65, 0, Math.PI * 2);
    ctx.fill();

    // Draw Red Mallet (Joiner)
    if (paddle2Img.complete && paddle2Img.naturalWidth !== 0) {
        ctx.drawImage(
            paddle2Img,
            state.player2.x - paddleSize / 2,
            state.player2.y - paddleSize / 2,
            paddleSize,
            paddleSize
        );
    } else {
        ctx.fillStyle = '#ff3333';
        ctx.beginPath();
        ctx.arc(state.player2.x, state.player2.y, paddleSize / 2, 0, Math.PI * 2);
        ctx.fill();
    }

    // Draw Goal for Player 2
    ctx.fillStyle = '#ff3333';
    ctx.beginPath();
    ctx.arc(gx2, gy2, 65, 0, Math.PI * 2);
    ctx.fill();

    // Draw Puck
    if (puckImg.complete && puckImg.naturalWidth !== 0) {
        ctx.drawImage(
            puckImg,
            state.puck.x - puckSize / 2,
            state.puck.y - puckSize / 2,
            puckSize,
            puckSize
        );
    } else {
        ctx.fillStyle = '#111111';
        ctx.beginPath();
        ctx.arc(state.puck.x, state.puck.y, puckSize / 2, 0, Math.PI * 2);
        ctx.fill();
    }
});

// --- Speed Multiplier Control ---
function changeSM() {
    const newSpeed = prompt("Enter new hit speed multiplier:");
    console.log('Prompt value:', newSpeed);
    if (newSpeed !== null && newSpeed.trim() !== '') {
        const parsedSpeed = parseFloat(newSpeed);
        console.log('Parsed speed:', parsedSpeed);
        if (!isNaN(parsedSpeed) && parsedSpeed > 0) {
            console.log('Emitting changeSpeedMultiplier with:', parsedSpeed);
            socket.emit('changeSpeedMultiplier', parsedSpeed);
        } else {
            alert('Please enter a valid positive number');
        }
    }
}

// --- Mouse Controls Handling ---
canvas.addEventListener('mousemove', (e) => {
    if (myRole === 'spectator') return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    socket.emit('updateMallet', { x: mouseX, y: mouseY });
});