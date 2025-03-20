document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    const canvas = document.getElementById('drawingCanvas');
    const ctx = canvas.getContext('2d');
    const usersCount = document.getElementById('usersCount');
    
    function resizeCanvas() {
        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Initial resize
    resizeCanvas();
    
    // Resize canvas when window is resized
    window.addEventListener('resize', resizeCanvas);
    
    // Drawing state
    let isDrawing = false;
    let currentColor = '#000000';
    let currentMode = 'draw';
    let brushSize = 5;
    let lastX = 0;
    let lastY = 0;
    
    // Socket.IO event handlers
    socket.on('users-count', (count) => {
        usersCount.textContent = `Connected users: ${count}`;
    });
    
    socket.on('canvas-state', (state) => {
        state.forEach(action => {
            if (action.type === 'draw') {
                drawLine(action.x1, action.y1, action.x2, action.y2, action.color, action.size);
            } else if (action.type === 'fill') {
                fillCanvas(action.color);
            }
        });
    });
    
    socket.on('draw-line', (data) => {
        drawLine(data.x1, data.y1, data.x2, data.y2, data.color, data.size);
    });
    
    socket.on('fill-canvas', (data) => {
        fillCanvas(data.color);
    });
    
    socket.on('clear-canvas', () => {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    });
    
    // Color buttons
    const colorButtons = document.querySelectorAll('.color-btn');
    colorButtons.forEach(button => {
        button.addEventListener('click', () => {
            currentColor = button.dataset.color;
            if (currentMode === 'fill') {
                fillCanvas(currentColor);
                socket.emit('fill-canvas', { color: currentColor });
            }
        });
    });
    
    // Brush size
    const brushSizeInput = document.getElementById('brushSize');
    brushSizeInput.addEventListener('input', (e) => {
        brushSize = e.target.value;
    });
    
    // Drawing modes
    const modeButtons = document.querySelectorAll('.mode-btn');
    modeButtons.forEach(button => {
        button.addEventListener('click', () => {
            modeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentMode = button.dataset.mode;
        });
    });
    
    // Clear canvas
    document.getElementById('clearCanvas').addEventListener('click', () => {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        socket.emit('clear-canvas');
    });
    
    // Save drawing
    document.getElementById('saveDrawing').addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'drawing.png';
        link.href = canvas.toDataURL();
        link.click();
    });
    
    // Drawing functions
    function drawLine(x1, y1, x2, y2, color, size) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = color;
        ctx.lineWidth = size;
        ctx.lineCap = 'round';
        ctx.stroke();
    }
    
    function fillCanvas(color) {
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    function startDrawing(e) {
        isDrawing = true;
        [lastX, lastY] = getCoordinates(e);
        
        if (currentMode === 'fill') {
            fillCanvas(currentColor);
            socket.emit('fill-canvas', { color: currentColor });
        }
    }
    
    function draw(e) {
        if (!isDrawing) return;
        if (currentMode === 'fill') return;
        
        const [currentX, currentY] = getCoordinates(e);
        
        if (currentMode === 'draw') {
            drawLine(lastX, lastY, currentX, currentY, currentColor, brushSize);
            socket.emit('draw-line', {
                x1: lastX,
                y1: lastY,
                x2: currentX,
                y2: currentY,
                color: currentColor,
                size: brushSize,
                type: 'draw'
            });
        } else if (currentMode === 'eraser') {
            drawLine(lastX, lastY, currentX, currentY, '#FFFFFF', brushSize);
            socket.emit('draw-line', {
                x1: lastX,
                y1: lastY,
                x2: currentX,
                y2: currentY,
                color: '#FFFFFF',
                size: brushSize,
                type: 'draw'
            });
        }
        
        [lastX, lastY] = [currentX, currentY];
    }
    
    function stopDrawing() {
        isDrawing = false;
    }
    
    function getCoordinates(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        return [x, y];
    }
    
    // Event listeners
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // Touch events for mobile devices
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    });
    
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    });
    
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        const mouseEvent = new MouseEvent('mouseup', {});
        canvas.dispatchEvent(mouseEvent);
    });
}); 