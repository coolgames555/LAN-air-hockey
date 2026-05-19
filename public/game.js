const socket = io();
const canvas = document.getElementById('rink');
const ctx = canvas.getContext('2d');

const menuDiv = document.getElementById('menu');
const gameContainer = document.getElementById('gameContainer');
const errorMsg = document.getElementById('menuError');
const statusText = document.getElementById('status');

let myRole = 'spectator';
let gx1 = 0;
let gy1 = 360;
let gx2 = 1080;
let gy2 = 360;

// --- UI Interaction Hooks ---
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

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Rink separator line
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(540, 0);
    ctx.lineTo(540, 720);
    ctx.stroke();
    
    // Draw Blue Mallet (Host)
    ctx.fillStyle = '#0055ff';
    ctx.beginPath();
    ctx.arc(state.player1.x, state.player1.y, 30, 0, Math.PI * 2);
    ctx.fill();

    // Draw Goal for Player 1
    ctx.fillStyle = '#0055ff';
    ctx.beginPath();
    ctx.arc(gx1, gy1, 65, 0, Math.PI * 2);
    ctx.fill();

        // Draw Red Mallet (Joiner)
    ctx.fillStyle = '#ff3333';
    ctx.beginPath();
    ctx.arc(state.player2.x, state.player2.y, 30, 0, Math.PI * 2);
    ctx.fill();

    // Draw Goal for Player 2
    ctx.fillStyle = '#ff3333';
    ctx.beginPath();
    ctx.arc(gx2, gy2, 65, 0, Math.PI * 2);
    ctx.fill();

    // Draw Puck
    ctx.fillStyle = '#111111';
    ctx.beginPath();
    ctx.arc(state.puck.x, state.puck.y, 15, 0, Math.PI * 2);
    ctx.fill();
});

// --- Mouse Controls Handling ---
canvas.addEventListener('mousemove', (e) => {
    if (myRole === 'spectator') return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    socket.emit('updateMallet', { x: mouseX, y: mouseY });
});