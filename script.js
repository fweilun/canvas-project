document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('drawingCanvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;
    
    // Drawing state
    let isDrawing = false;
    let currentColor = '#000000';
    let currentMode = 'draw';
    let brushSize = 5;
    let lastX = 0;
    let lastY = 0;
    
    // Color buttons
    const colorButtons = document.querySelectorAll('.color-btn');
    colorButtons.forEach(button => {
        button.addEventListener('click', () => {
            currentColor = button.dataset.color;
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
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
    
    // Save drawing
    document.getElementById('saveDrawing').addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'drawing.png';
        link.href = canvas.toDataURL();
        link.click();
    });
    
    // Drawing functions
    function startDrawing(e) {
        isDrawing = true;
        [lastX, lastY] = getCoordinates(e);
    }
    
    function draw(e) {
        if (!isDrawing) return;
        
        const [currentX, currentY] = getCoordinates(e);
        
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(currentX, currentY);
        
        if (currentMode === 'draw') {
            ctx.strokeStyle = currentColor;
            ctx.lineWidth = brushSize;
            ctx.lineCap = 'round';
            ctx.stroke();
        } else if (currentMode === 'eraser') {
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = brushSize;
            ctx.lineCap = 'round';
            ctx.stroke();
        } else if (currentMode === 'fill') {
            ctx.fillStyle = currentColor;
            ctx.fillRect(currentX - brushSize/2, currentY - brushSize/2, brushSize, brushSize);
        }
        
        [lastX, lastY] = [currentX, currentY];
    }
    
    function stopDrawing() {
        isDrawing = false;
    }
    
    function getCoordinates(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
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