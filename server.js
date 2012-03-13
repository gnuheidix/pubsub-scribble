var io = require('socket.io').listen(8080);

io.configure(function(){
    io.enable('browser client minification');   // send minified client
    io.enable('browser client etag');           // apply etag caching logic
    io.enable('browser client gzip');           // gzip the file
    io.set('log level', 1);                     // reduce logging
    io.set('transports'                         // enable all transports
            , ['websocket'
              , 'flashsocket'
              , 'htmlfile'
              , 'xhr-polling'
              , 'jsonp-polling'
            ]
    );
});

// checks for malicious content
var posOK = function(posObj){
    //do stuff
    return true;
};

io.sockets.on('connection', function(socket) {
    socket.on('move', function(pos){
        if(posOK(pos)){
			socket.broadcast.emit('moved', pos);
        }
    });
});
