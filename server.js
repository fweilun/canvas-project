const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Serve static files
app.use(express.static('./'));

// Store canvas state
let canvasState = [];
let userCount = 0;

io.on('connection', (socket) => {
    userCount++;
    console.log('A user connected');
    io.emit('users-count', userCount);
    
    // Send existing canvas state to new users
    socket.emit('canvas-state', canvasState);
    
    // Handle drawing events
    socket.on('draw-line', (data) => {
        canvasState.push(data);
        socket.broadcast.emit('draw-line', data);
    });
    
    // Handle fill events
    socket.on('fill-canvas', (data) => {
        canvasState = [data]; // Reset state when canvas is filled
        socket.broadcast.emit('fill-canvas', data);
    });
    
    // Handle clear canvas
    socket.on('clear-canvas', () => {
        canvasState = [];
        socket.broadcast.emit('clear-canvas');
    });
    
    socket.on('disconnect', () => {
        userCount--;
        io.emit('users-count', userCount);
        console.log('A user disconnected');
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 