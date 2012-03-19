/*
 * pubsub-scribble client
 *
 * @license MIT License
 * @author  Thomas Heidrich, Adrian Kummerländer
 * @copyright Copyright (c) 2012 Thomas Heidrich and other authors
 */

// basic initializations
var canvas  = document.getElementById('spielwiese');
var helper  = document.getElementById('helperlayer');
var picker  = document.getElementById('farbe');
var header  = document.getElementById('oben');
var footer  = document.getElementById('unten');
var connStatus = document.getElementById('status');
var pngexp = document.getElementById('pngexport');
var mouse = false;
var oldMouseX = 0;
var oldMouseY = 0;
var exportNumber = 1;
var toolMode = 0;
var crosshairs = false;

// connection establishment
var socket = io.connect('http://127.0.0.1:8080', {
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
    helper.setAttribute('width', windowW - 10);
    helper.setAttribute('height', windowH - footerH - headerH - 50);
}

var getPos = function(mouseX, mouseY){
    return {
        x: mouseX - canvas.offsetLeft
        , y: mouseY - canvas.offsetTop
        , c: picker.value
        , oldX: oldMouseX - canvas.offsetLeft
        , oldY: oldMouseY - canvas.offsetTop
        , t: toolMode
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
        
        if(local){
            ctx.strokeStyle = hexToRGBA(pos.c, 0.1);
        }else{
            ctx.strokeStyle = '#' + pos.c;
        }
        switch(pos.t){
            case '0':
                ctx.lineWidth = 1;
                break;
            default:
            case '1':
                ctx.lineWidth = 6;
                break;
            case '2':
                ctx.lineWidth = 12;
                break;
        }
        
        ctx.lineCap = 'round';
        ctx.moveTo(pos.oldX, pos.oldY);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        ctx.closePath();
    }
};

var clearHelperLayer = function(){
    if(helper.getContext){
        helper.getContext('2d').clearRect(0,0,helper.width,helper.height);
    }
};

var drawCrosshairs = function(mouseX, mouseY){
    if(helper.getContext){
        var ctx = helper.getContext('2d');

        mouseX = mouseX - helper.offsetLeft;
        mouseY = mouseY - helper.offsetTop; 

        ctx.beginPath();
        
        ctx.clearRect(0,0,helper.width,helper.height)

        ctx.lineWidth = 2;
        ctx.strokeStyle = 'silver';
        
        ctx.moveTo(mouseX, 0);
        ctx.lineTo(mouseX, helper.height);

        ctx.moveTo(0, mouseY);
        ctx.lineTo(helper.width, mouseY);

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
    if(crosshairs){
        drawCrosshairs(evt.clientX, evt.clientY);   
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
    toolMode = document.getElementById('werkzeug').value;
    mouse = true;
    oldMouseX = evt.clientX;
    oldMouseY = evt.clientY;
    
    curPos = getPos(evt.clientX, evt.clientY);
    drawLine(curPos, true);
    socket.emit('move', curPos);
};

var handleTouchStart = function(evt){
    toolMode = document.getElementById('werkzeug').value;
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

var handleCrosshairCheck = function(){
    if(document.getElementById('crosshairs').checked){
        crosshairs = true;  
    }else{
        crosshairs = false;    
        clearHelperLayer();      
    }
};

// setup of UI events (socket send)
document.addEventListener('mousedown', handleMouseDown);
document.addEventListener('mouseup', handleMouseUp);
document.addEventListener('mousemove', handleMouseMove);
document.addEventListener('touchmove', handleTouchMove);
document.addEventListener('touchstart', handleTouchStart);
document.addEventListener('touchend', handleMouseUp);

document.getElementById('crosshairs').addEventListener('click', handleCrosshairCheck);

// setup of UI events (misc)
pngexp.addEventListener('click', handlePNGExport);
window.onresize = initUI;

// UI init
initUI();

// setup socket receive events
socket.on('connect', function(){
    connStatus.innerHTML = '<span style="color:#00FF00;">verbunden</span>';
    
    socket.on('moved', function(pos){
        drawLine(pos, false);
    });
});

socket.on('disconnect', function(){
    connStatus.innerHTML = '<span style="color:#FF0000;">getrennt</span>';
});

socket.on('reconnecting', function(){
    connStatus.innerHTML = '<span style="color:#FFFF00;">verbinde...</span>';
});

socket.on('reconnect_failed', function(){
    connStatus.innerHTML = '<span style="color:#FF0000;">wiederverbinden fehlgeschlagen</span>';
});


