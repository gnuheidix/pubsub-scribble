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

        if (local) {
            ctx.strokeStyle = hexToRGBA(pos.c, 0.1);
        }
        else {
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
document.addEventListener('mousemove',function(evt){
    if(mouse){
    	tmpPos = getConfig(evt.clientX, evt.clientY);
        socket.emit('move', tmpPos);
        drawLine(tmpPos, true);
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
    
    tmpPos = getConfig(evt.clientX, evt.clientY);
    socket.emit('move', tmpPos);
    drawLine(tmpPos, true);
});

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
            drawLine(pos, false);
        });
    }
});
