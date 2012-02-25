var io = require('socket.io').listen(8080);

io.sockets.on('connection', function(socket) {
	socket.on('move', function(pos) {
		io.sockets.emit('moved', pos);
	});
});
