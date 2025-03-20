document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('drawingCanvas');
    const ctx = canvas.getContext('2d');
    
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
    
    // Color buttons
    const colorButtons = document.querySelectorAll('.color-btn');
    colorButtons.forEach(button => {
        button.addEventListener('click', () => {
            currentColor = button.dataset.color;
            if (currentMode === 'fill') {
                fillCanvas(currentColor);
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
    });
    
    // Save drawing
    document.getElementById('saveDrawing').addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'drawing.png';
        link.href = canvas.toDataURL();
        link.click();
    });
    
    // Fill canvas function
    function fillCanvas(color) {
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Drawing functions
    function startDrawing(e) {
        isDrawing = true;
        [lastX, lastY] = getCoordinates(e);
        
        if (currentMode === 'fill') {
            fillCanvas(currentColor);
        }
    }
    
    function draw(e) {
        if (!isDrawing) return;
        if (currentMode === 'fill') return;
        
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