var svg = new Two({
    fullscreen: true,
    autostart: true
}).appendTo(document.body);

var rect = svg.makeRectangle(svg.width / 2, svg.height / 1.2, 150, 150);
rect.fill = 'rgb(255, 255, 255)';
svg.bind('update', function() {
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