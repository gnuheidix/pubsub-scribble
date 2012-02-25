var io = require('socket.io').listen(3001);

io.sockets.on('connection', function(socket) {
	socket.on('move', function(pos) {
		console.log(pos);
		io.sockets.emit('moved', pos);
	});
});