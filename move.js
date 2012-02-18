var pubsub = pubsubio.connect('gnuheidix.de:8080');
var mouse = false;
var windowW;
var windowH;
var canvas = document.getElementById('spielwiese');

var resize = function(){
    windowW = window.innerWidth;
    windowH = window.innerHeight;
    canvas.setAttribute('width', windowW);
    canvas.setAttribute('height', windowH);
}
resize();
window.onresize = resize;

pubsub.subscribe({name:'move'}, function(msg){
    if(canvas.getContext){
        var ctx = canvas.getContext('2d');
        ctx.fillRect(msg.x, msg.y, -10, -10);
    }
});

document.addEventListener('mousemove',function(evt){
    if(mouse){
        var config = {name: 'move'
                        , x: evt.clientX
                        , y: evt.clientY
                        , m: mouse
        };
        pubsub.publish(config);
    }
});

document.addEventListener('mouseup', function(){ mouse = false; });
document.addEventListener('mousedown', function(){ mouse = true; });
