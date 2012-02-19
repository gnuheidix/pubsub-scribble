var pubsub = pubsubio.connect('gnuheidix.de:8080');
var canvas = document.getElementById('spielwiese');
var picker = document.getElementById('farbe');
var header = document.getElementById('oben');
var footer = document.getElementById('unten');
var pubsubChannel = 'move';
var mouse = false;

var resize = function(){
    var windowW = window.innerWidth;
    var windowH = window.innerHeight;
    var headerH = header.offsetHeight;
    var footerH = footer.offsetHeight;
    canvas.setAttribute('width', windowW);
    canvas.setAttribute('height', windowH - footerH - headerH - 50);
}

var getConfig = function(mouseX, mouseY){
    return {
        name: pubsubChannel
        , x: mouseX - canvas.offsetLeft
        , y: mouseY - canvas.offsetTop
        , c: picker.value
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

window.onresize = resize;

resize();

pubsub.subscribe({name:pubsubChannel}, function(msg){
    if(canvas.getContext){
        var ctx = canvas.getContext('2d');
	ctx.fillStyle = '#' + msg.c;
        ctx.fillRect(msg.x, msg.y, -10, -10);
    }
});
