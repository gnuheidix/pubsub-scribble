/*
 * pubsub-scribble client
 *
 * @license MIT License
 * @author  Thomas Heidrich, Adrian Kummerländer
 * @copyright Copyright (c) 2012 Thomas Heidrich and other authors
 */

// basic initializations
var canvas = document.getElementById('spielwiese');
var picker = document.getElementById('farbe');
var header = document.getElementById('oben');
var footer = document.getElementById('unten');
var pngexp = document.getElementById('pngexport');
var mouse = false;
var oldMouseX = 0;
var oldMouseY = 0;
var exportNumber = 1;

// connection establishment
var socket = io.connect('http://scribble.gnuheidix.de:8080', {
    'connect timeout': 5000,
    'reconnect': true,
    'reconnection delay': 500,
    'max reconnection attempts': 10,
    'try multiple transports': true,
    'transports':  [
        'websocket',
        'flashsocket',
        'htmlfile',
        'xhr-polling',
        'xhr-multipart',
        'jsonp-polling',
    ]
});

// convenience functions
var initUI = function(){
    var windowW = window.innerWidth;
    var windowH = window.innerHeight;
    var headerH = header.offsetHeight;
    var footerH = footer.offsetHeight;
    canvas.setAttribute('width', windowW - 10);
    canvas.setAttribute('height', windowH - footerH - headerH - 50);
}

var getPos = function(mouseX, mouseY){
    return {
        x: mouseX - canvas.offsetLeft - 5
        , y: mouseY - canvas.offsetTop - 5
        , c: picker.value
        , oldX: oldMouseX - canvas.offsetLeft - 5
        , oldY: oldMouseY - canvas.offsetTop - 5
    };
};

var hexToRGBA = function(color, alpha) {
    r = parseInt( color.substring(0,2), 16);
    g = parseInt( color.substring(2,4), 16);
    b = parseInt( color.substring(4,6), 16);
    
    return ('rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')');
};

var drawLine = function(pos, local){
    if(canvas.getContext){
        var ctx = canvas.getContext('2d');
        
        ctx.beginPath();
        
        if (local){
            ctx.strokeStyle = hexToRGBA(pos.c, 0.1);
        }
        else{
            ctx.strokeStyle = '#' + pos.c;
        }
        
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';
        ctx.moveTo(pos.oldX, pos.oldY);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        ctx.closePath();
    }
};

// setup of UI events (socket send)
var handleMouseMove = function(evt){
    if(mouse){
        curPos = getPos(evt.clientX, evt.clientY);
        drawLine(curPos, true);
        socket.emit('move', curPos);
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
    
    curPos = getPos(evt.clientX, evt.clientY);
    drawLine(curPos, true);
    socket.emit('move', curPos);
};

var handleTouchStart = function(evt){
    if(evt.changedTouches.length == 1){ // disable multitouch
        mouse = true;
        oldMouseX = evt.changedTouches[0].clientX;
        oldMouseY = evt.changedTouches[0].clientY;
    }
};

var handlePNGExport = function(evt){
    exportwindow = window.open('', 'export' + exportNumber);
    exportwindow.document.writeln('<html><head>');
    exportwindow.document.writeln('<title>PNG Export '
                                    + exportNumber
                                    + ' - Scribble - gnuheidix.de</title>');
    exportwindow.document.writeln('</head><body>');
    exportwindow.document.writeln('<img '
                                    + 'src="'+canvas.toDataURL('image/png')+'"'
                                    + 'alt="Kritzelexport"'
                                    + '/>'
    );
    exportwindow.document.writeln('</body></html>');
    exportwindow.document.close();
    ++exportNumber;
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

// setup of UI events (misc)
pngexp.addEventListener('click', handlePNGExport);
window.onresize = initUI;

// UI init
initUI();

// setup socket receive events
socket.on('connect', function () {
    console.log('connected');
    
    socket.on('moved', function(pos){
        drawLine(pos, false);
    });
});

socket.on('disconnect', function(){
    console.log('disconnected');
});
