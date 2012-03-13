var socket = io.connect('http://scribble.gnuheidix.de:8080');

var canvas = document.getElementById('spielwiese');
var picker = document.getElementById('farbe');
var header = document.getElementById('oben');
var footer = document.getElementById('unten');
var pngexp = document.getElementById('pngexport');
var mouse = false;
var oldMouseX = 0;
var oldMouseY = 0;

// convenience functions
var initUI = function(){
    var windowW = window.innerWidth;
    var windowH = window.innerHeight;
    var headerH = header.offsetHeight;
    var footerH = footer.offsetHeight;
    canvas.setAttribute('width', windowW - 10);
    canvas.setAttribute('height', windowH - footerH - headerH - 50);
}

var getConfig = function(mouseX, mouseY){
    return {
        x: mouseX - canvas.offsetLeft - 5
        , y: mouseY - canvas.offsetTop - 5
        , c: picker.value
        , oldX: oldMouseX - canvas.offsetLeft - 5
        , oldY: oldMouseY - canvas.offsetTop - 5
    };
};

var getDistance = function(posObj){
    return Math.abs(posObj.x - posObj.oldX) + Math.abs(posObj.y - posObj.oldY);
};

// setup of UI events (socket send)
document.addEventListener('mousemove',function(evt){
    if(mouse){
        socket.emit('move', getConfig(evt.clientX, evt.clientY));
    }
    oldMouseX = evt.clientX;
    oldMouseY = evt.clientY;
});

document.addEventListener('mouseup', function(evt){
    mouse = false;
});

document.addEventListener('mousedown', function(evt){
    mouse = true;
    oldMouseX = evt.clientX;
    oldMouseY = evt.clientY;
    
    socket.emit('move', getConfig(evt.clientX, evt.clientY));
});

window.onresize = initUI();

pngexp.addEventListener('click', function(evt){
    exportwindow = window.open('', 'export');
    exportwindow.document.writeln('<img '
                                    + 'src="'+canvas.toDataURL('image/png')+'"'
                                    + 'alt="Kritzelexport"'
                                    + '/>'
    );
    exportwindow.document.close();
})

// UI init
initUI();

// socket receive events
socket.on('connect', function () {
    console.log('connected');

    if(canvas.getContext){
        var ctx = canvas.getContext('2d');
        
        socket.on('moved', function(pos){
            if(getDistance(pos) > 5){ // long distance => line
                ctx.beginPath();
                ctx.strokeStyle = '#' + pos.c;
                ctx.lineWidth = 10;
                ctx.moveTo(pos.oldX, pos.oldY);
                ctx.lineTo(pos.x, pos.y);
                ctx.stroke();
                ctx.closePath();
            }else{ // short distance => rectangle
                ctx.fillStyle = '#' + pos.c;
                ctx.fillRect(pos.x - 5, pos.y - 5, 10, 10);
            }
        });
    }
});
