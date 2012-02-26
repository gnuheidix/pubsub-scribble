var io = require('socket.io').listen(8080);

io.configure(function(){
        io.set('origin', 'scribble.gnuheidix.de:8080')
	io.enable('browser client minification');  // send minified client
	io.enable('browser client etag');          // apply etag caching logic based on version number
	io.enable('browser client gzip');          // gzip the file
	io.set('log level', 1);                    // reduce logging
	io.set('transports', [                     // enable all transports (optional if you want flashsocket)
	    'websocket'
	  , 'flashsocket'
	  , 'htmlfile'
	  , 'xhr-polling'
 	  , 'jsonp-polling'
	]);
});

io.sockets.on('connection', function(socket) {
	socket.on('move', function(pos) {
		io.sockets.emit('moved', pos);
	});
});
