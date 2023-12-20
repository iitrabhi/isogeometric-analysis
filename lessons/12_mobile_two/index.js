// To enable your circle created with Two.js to be 
// draggable both with a mouse and with touch on 
// mobile devices, you need to handle both mouse events 
// and touch events. The basic events you'll be looking at 
// are mousedown and touchstart for the initial contact, 
// mousemove and touchmove for the dragging, and mouseup and 
// touchend for releasing the drag.

// Assuming you have a Two.js instance and a circle
var two = new Two({ fullscreen: true }).appendTo(document.body);
var circle = two.makeCircle(70, 70, 50);
circle.fill = '#FFFFFF';
circle.noStroke();

two.update();

function onMove(e) {
    // Normalize touch and mouse coordinates
    var clientX, clientY;
    if (e.touches) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }

    // Update circle position
    circle.translation.set(clientX, clientY);
    two.update();
}

function onUp(e) {
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup', onUp);
    window.removeEventListener('touchmove', onMove);
    window.removeEventListener('touchend', onUp);
}

function onDown(e) {
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('touchend', onUp);
}

// Add event listeners for both mouse and touch events
circle._renderer.elem.addEventListener('mousedown', onDown);
circle._renderer.elem.addEventListener('touchstart', onDown);
