/*
 * pubsub-scribble server
 *
 * @license MIT License
 * @author  Thomas Heidrich, Adrian Kummerländer
 * @copyright Copyright (c) 2012 Thomas Heidrich and other authors
 */

var io = require('socket.io').listen(8080);
var check = require('validator').check;

io.configure(function(){
    io.enable('browser client minification');   // send minified client
    io.enable('browser client etag');           // apply etag caching logic
    io.enable('browser client gzip');           // gzip the file
    io.set('log level', 1);                     // reduce logging
    io.set('heartbeat interval', 6);            // short period heartbeats
    io.set('heartbeat timeout', 10);            //     and timeout
    // enable all supported transports
    io.set('transports', [
        'websocket',
        'xhr-polling',
        'jsonp-polling',
    ]);
});

// checks for malicious content
var posOK = function(posObj){
    //check stuff
    return true;
};

io.sockets.on('connection', function(socket) {
    socket.on('move', function(pos){
//        if(posOK(pos)){
            io.sockets.emit('moved', pos);
//        }
    });
});
