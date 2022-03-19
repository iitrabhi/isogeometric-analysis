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

function changeColor(color) {
    rect.fill = color;
}