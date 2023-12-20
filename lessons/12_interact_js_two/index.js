// Create a Two.js instance
const elem = document.getElementById('slider-container');
const params = { width: 500, height: 100 };
const two = new Two(params).appendTo(elem);

// Create the line for the slider
const line = two.makeLine(50, 50, 450, 50);
line.stroke = 'black';

// Create the circle for the slider handle
const circle = two.makeCircle(50, 50, 10);
circle.fill = '#FF8000';
circle.stroke = 'orangered';
two.update();
// Function to update the slider handle position
function updateSlider(x) {
  circle.translation.set(x, 50);
  two.update();
}

// Set up interact.js on the circle
interact(circle._renderer.elem)
  .draggable({
    restrict: {
      restriction: 'parent',
      endOnly: true
    },
    onmove: function (event) {
      let x = circle.translation.x + event.dx;
      x = Math.max(50, Math.min(x, 450)); // Constrain within line
      updateSlider(x);
    }
  });

// Initial render
two.update();

// Function to log pointer events (similar to the original code)
function logEvent(event) {
  // Logging event details
  console.log(event.type, event.pageX, event.pageY);
}

// Adding event listeners for pointer events on the circle
['tap', 'doubletap', 'hold', 'down', 'move', 'up'].forEach(eventType => {
  interact(circle._renderer.elem).on(eventType, logEvent);
});
