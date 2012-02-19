var pubsub = pubsubio.connect('gnuheidix.de:8080');
var canvas = document.getElementById('spielwiese');
var pubsubChannel = 'move';
var mouse = false;
var windowW;
var windowH;

var resize = function(){
    windowW = window.innerWidth;
    windowH = window.innerHeight;
    canvas.setAttribute('width', windowW);
    canvas.setAttribute('height', windowH);
}
window.onresize = resize;

pubsub.subscribe({name:pubsubChannel}, function(msg){
    if(canvas.getContext){
        var ctx = canvas.getContext('2d');
        ctx.fillRect(msg.x, msg.y, -10, -10);
    }
});

var getConfig = function(mouseX, mouseY){
    return {
        name: pubsubChannel
        , x: (mouseX - canvas.offsetLeft)
        , y: (mouseY - canvas.offsetTop)
    };
};

document.addEventListener('mousemove',function(evt){
    if(mouse){
        pubsub.publish(getConfig(evt.clientX, evt.clientY));
    }
});

document.addEventListener('mouseup', function(evt){
    mouse = false;
});

document.addEventListener('mousedown', function(evt){
    mouse = true;
    pubsub.publish(getConfig(evt.clientX, evt.clientY));
});

resize();
