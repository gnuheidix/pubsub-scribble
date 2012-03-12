var socket = io.connect('http://scribble.gnuheidix.de:8080');

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
    canvas.setAttribute('width', windowW - 10);
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

document.addEventListener('touchmove',function(evt){
    evt.preventDefault();
    socket.emit('move', getConfig(evt.clientX, evt.clientY));
});

document.addEventListener('mouseup', function(evt){
    mouse = false;
});

document.addEventListener('mousedown', function(evt){
    mouse = true;

    socket.emit('newPos', getConfig(evt.clientX, evt.clientY));
});

window.onresize = resize;

resize();

socket.on('connect', function () {
    console.log('connected');

	if(canvas.getContext){
		var ctx = canvas.getContext('2d');
    
    	socket.on('moved', function(pos) {
            ctx.strokeStyle = '#' + pos.c;
            ctx.lineWidth = 10;
	
			ctx.lineTo(pos.x, pos.y);   
			ctx.stroke();      
   	 	});
    
    	socket.on('posChanged', function(pos) {
			ctx.beginPath();
			
			ctx.fillStyle = '#' + pos.c;
			
			ctx.moveTo(pos.x, pos.y);
            ctx.fillRect(pos.x - 5, pos.y - 5, 10, 10);       
    	});
    }
});
