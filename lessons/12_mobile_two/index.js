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
circle.fill = '#2A4471';
circle.noStroke();




two.update();
circle._renderer.elem.addEventListener('touchstart', onDown, { passive: false });
circle._renderer.elem.addEventListener('touchmove', onMove, { passive: false });
// Apply the same for other touch or wheel events as necessary
function onMove(e) {
    e.preventDefault(); // Prevents scrolling and other default actions

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
    e.preventDefault();
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    // Set the event listeners for touch events with passive: false
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp, { passive: false });
}

// Add event listeners for both mouse and touch events
circle._renderer.elem.addEventListener('mousedown', onDown);
// Set the initial touch event listener with passive: false
circle._renderer.elem.addEventListener('touchstart', onDown, { passive: false });