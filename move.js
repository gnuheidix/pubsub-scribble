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

document.addEventListener('mousemove',function(evt){
    if(mouse){
        var config = {name: pubsubChannel
                        , x: evt.clientX
                        , y: evt.clientY
        };
        pubsub.publish(config);
    }
});

document.addEventListener('mouseup', function(evt){
    mouse = false;
});

document.addEventListener('mousedown', function(evt){
    mouse = true;
    var config = {name: pubsubChannel
                    , x: evt.clientX
                    , y: evt.clientY
    };
    pubsub.publish(config);
});

resize();
