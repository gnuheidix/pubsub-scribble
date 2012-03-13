var socket = io.connect('http://scribble.gnuheidix.de:8080');

var canvas = document.getElementById('spielwiese');
var picker = document.getElementById('farbe');
var header = document.getElementById('oben');
var footer = document.getElementById('unten');
var pngexp = document.getElementById('pngexport');
var mouse = false;
var oldMouseX = 0;
var oldMouseY = 0;
var exportNumber = 1;

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

var handleMouseMove = function(evt){
    if(mouse){
        socket.emit('move', getConfig(evt.clientX, evt.clientY));
    }
    oldMouseX = evt.clientX;
    oldMouseY = evt.clientY;
};

var handleTouchMove = function(evt){
    evt.preventDefault();
    
    if(evt.changedTouches.length == 1){ // disable multitouch
        handleMouseMove(evt.changedTouches[0]);
    }
};

var handleMouseDown = function(evt){
    mouse = true;
    oldMouseX = evt.clientX;
    oldMouseY = evt.clientY;
    
    socket.emit('move', getConfig(evt.clientX, evt.clientY));
};

var handleTouchStart = function(evt){
    if(evt.changedTouches.length == 1){ // disable multitouch
        mouse = true;
        oldMouseX = evt.changedTouches[0].clientX;
        oldMouseY = evt.changedTouches[0].clientY;
    }
};

var handleMouseUp = function(){
    mouse = false;
};

// setup of UI events (socket send)
document.addEventListener('mousedown', handleMouseDown);
document.addEventListener('mouseup', handleMouseUp);
document.addEventListener('mousemove', handleMouseMove);
document.addEventListener('touchmove', handleTouchMove);
document.addEventListener('touchstart', handleTouchStart);
document.addEventListener('touchend', handleMouseUp);
window.onresize = initUI();

pngexp.addEventListener('click', function(evt){
    exportwindow = window.open('', 'export' + exportNumber);
    exportwindow.document.writeln('<html><head>');
    exportwindow.document.writeln('<title>PNG Export ' + exportNumber + ' - Scribble - gnuheidix.de</title>');
    exportwindow.document.writeln('</head><body>');
    exportwindow.document.writeln('<img '
                                    + 'src="'+canvas.toDataURL('image/png')+'"'
                                    + 'alt="Kritzelexport"'
                                    + '/>'
    );
    exportwindow.document.writeln('</body></html>');
    exportwindow.document.close();
    ++exportNumber;
});

// UI init
initUI();

// socket receive events
socket.on('connect', function () {
    console.log('connected');
    
    if(canvas.getContext){
        var ctx = canvas.getContext('2d');
        
        socket.on('moved', function(pos){
            ctx.beginPath();
            ctx.strokeStyle = '#' + pos.c;
            ctx.lineWidth = 10;
            ctx.lineCap = 'round';
            ctx.moveTo(pos.oldX, pos.oldY);
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
            ctx.closePath();
        });
    }
});
