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
        'xhr-polling',
        'websocket',
        'jsonp-polling',
    ]);
});

// checks for malicious content
// { x: 204, y: 380, c: 'FF0000', oldX: 203, oldY: 379, t: '0' }
var isValid = function(posObj){
    var retval = true;
    try{
        check(posObj.x).isInt().min(0).max(10000);
        check(posObj.y).isInt().min(0).max(10000);
        check(posObj.oldX).isInt().min(0).max(10000);
        check(posObj.oldY).isInt().min(0).max(10000);
        check(posObj.t).isInt().min(0).max(2);
        check(posObj.c).regex(/^[0-9a-f]{6}$/i);
    }catch(e){
        retval = false;
    }
    return retval;
};

io.sockets.on('connection', function(socket) {
    socket.on('move', function(pos){
        if(isValid(pos)){
            io.sockets.emit('moved', pos);
        }
    });
});

module.exports.isValid = isValid;
