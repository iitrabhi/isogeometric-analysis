var two = new Two({
    fullscreen: true,
    autostart: true
}).appendTo(document.body);
var rect = two.makeRectangle(two.width / 2, two.height / 2, 150, 150);
two.bind('update', function() {
    rect.rotation += 0.01;
});