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
    // enable all transports
    io.set('transports', [
        'websocket',
        'flashsocket',
        'htmlfile',
        'xhr-polling',
        'xhr-multipart',
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
