var socket = io.connect('http://127.0.0.1:3001');

var canvas = document.getElementById('spielwiese');
var picker = document.getElementById('farbe');
var header = document.getElementById('oben');
var footer = document.getElementById('unten');
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
        x: mouseX - canvas.offsetLeft
        , y: mouseY - canvas.offsetTop
        , c: picker.value
    };
};

document.addEventListener('mousemove',function(evt){
    if(mouse){
        socket.emit('move', getConfig(evt.clientX, evt.clientY));
    }
});

document.addEventListener('mouseup', function(evt){
    mouse = false;
});

document.addEventListener('mousedown', function(evt){
    mouse = true;

    socket.emit('move', getConfig(evt.clientX, evt.clientY));
});

window.onresize = resize;

resize();

socket.on('connect', function () {
    console.log('connected');

    socket.on('moved', function(pos) {
        console.log('test');

        if(canvas.getContext){
            var ctx = canvas.getContext('2d');
            ctx.fillStyle = '#' + pos.c;
            ctx.fillRect(pos.x, pos.y, -10, -10);
        }    

    });
});