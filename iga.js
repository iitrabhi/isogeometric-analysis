var two = new Two({
    type: Two.Types.canvas,
    fullscreen: true,
    autostart: true
}).appendTo(document.body);

var svg = new Two({
    fullscreen: true,
    autostart: true
}).appendTo(document.body);

var rect = svg.makeRectangle(two.width / 2, two.height / 2, 150, 150);
rect.fill = 'rgb(255, 255, 255)';
two.bind('update', function() {
    rect.rotation += 0.01;
});

svg.update();

rect._renderer.elem.addEventListener('mouseover', function() {
    changeColor('rgb(255, 100, 100)');
}, false);
rect._renderer.elem.addEventListener('mouseout', function() {
    changeColor('rgb(255, 255, 255)');
}, false);

// two.bind('update', function(frameCount) {
//     center.translation.set(two.width / 2, two.height / 2);
//     center.scale = 0.5 * (Math.sin(frameCount / 30) + 1) / 2 + 0.5;
//     for (var i = 0; i < circles.length; i++) {
//         var circle = circles[i];
//         var mag = circle.radius * Math.sin(circle.offset + frameCount / 15);
//         var x = mag * Math.cos(circle.theta) + center.translation.x;
//         var y = mag * Math.sin(circle.theta) + center.translation.y;
//         circle.translation.set(x, y);
//     }
// });

function changeColor(color) {
    rect.fill = color;
}