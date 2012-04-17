var assert = require('assert')
    ,vows = require('vows')
    ,server = require('../server.js')
;

var assertFalse = function(result){
    assert.equal(result, false);
};

var assertTrue = function(result){
    assert.equal(result, true);
};

vows
    .describe('server data validation (isValid)')
    .addBatch(
        {
            'null': {
                topic: server.isValid()
                ,'false expected': assertFalse
            }
            ,'empty object': {
                topic: server.isValid({})
                ,'false expected': assertFalse
            }
            ,'negative x': {
                topic: server.isValid({ x: -204, y: 380, c: 'FF0000', oldX: 203, oldY: 379, t: '0' })
                ,'false expected': assertFalse
            }
            ,'zero x': {
                topic: server.isValid({ x: 0, y: 380, c: 'FF0000', oldX: 203, oldY: 379, t: '0' })
                ,'true expected': assertTrue
            }
            ,'positive x': {
                topic: server.isValid({ x: 204, y: 380, c: 'FF0000', oldX: 203, oldY: 379, t: '0' })
                ,'true expected': assertTrue
            }
            ,'negative y': {
                topic: server.isValid({ x: 204, y: -380, c: 'FF0000', oldX: 203, oldY: 379, t: '0' })
                ,'false expected': assertFalse
            }
            ,'zero y': {
                topic: server.isValid({ x: 204, y: 0, c: 'FF0000', oldX: 203, oldY: 379, t: '0' })
                ,'true expected': assertTrue
            }
            ,'positive y': {
                topic: server.isValid({ x: 204, y: 380, c: 'FF0000', oldX: 203, oldY: 379, t: '0' })
                ,'true expected': assertTrue
            }
            ,'negative oldX': {
                topic: server.isValid({ x: 204, y: 380, c: 'FF0000', oldX: -203, oldY: 379, t: '0' })
                ,'false expected': assertFalse
            }
            ,'zero oldX': {
                topic: server.isValid({ x: 204, y: 380, c: 'FF0000', oldX: 0, oldY: 379, t: '0' })
                ,'true expected': assertTrue
            }
            ,'positive oldX': {
                topic: server.isValid({ x: 204, y: 380, c: 'FF0000', oldX: 203, oldY: 379, t: '0' })
                ,'true expected': assertTrue
            }
            ,'negative oldY': {
                topic: server.isValid({ x: 204, y: 380, c: 'FF0000', oldX: 203, oldY: -379, t: '0' })
                ,'false expected': assertFalse
            }
            ,'zero oldY': {
                topic: server.isValid({ x: 204, y: 380, c: 'FF0000', oldX: 203, oldY: 0, t: '0' })
                ,'true expected': assertTrue
            }
            ,'positive oldY': {
                topic: server.isValid({ x: 204, y: 380, c: 'FF0000', oldX: 203, oldY: 379, t: '0' })
                ,'true expected': assertTrue
            }
            ,'string oldY': {
                topic: server.isValid({ x: 204, y: 380, c: 'FF0000', oldX: 203, oldY: '300k', t: '0' })
                ,'false expected': assertFalse
            }
            ,'zero t': {
                topic: server.isValid({ x: 204, y: 380, c: 'FF0000', oldX: 203, oldY: 300, t: '0' })
                ,'true expected': assertTrue
            }
            ,'one t': {
                topic: server.isValid({ x: 204, y: 380, c: 'FF0000', oldX: 203, oldY: 300, t: '1' })
                ,'true expected': assertTrue
            }
            ,'two t': {
                topic: server.isValid({ x: 204, y: 380, c: 'FF0000', oldX: 203, oldY: 300, t: '2' })
                ,'true expected': assertTrue
            }
            ,'three t': {
                topic: server.isValid({ x: 204, y: 380, c: 'FF0000', oldX: 203, oldY: 300, t: '3' })
                ,'false expected': assertFalse
            }
            ,'negative t': {
                topic: server.isValid({ x: 204, y: 380, c: 'FF0000', oldX: 203, oldY: 300, t: '-1' })
                ,'false expected': assertFalse
            }
            ,'string t': {
                topic: server.isValid({ x: 204, y: 380, c: 'FF0000', oldX: 203, oldY: 300, t: 'abc' })
                ,'false expected': assertFalse
            }
            ,'123abc c': {
                topic: server.isValid({ x: 204, y: 380, c: '123abc', oldX: 203, oldY: 300, t: '0' })
                ,'true expected': assertTrue
            }
            ,'1a2b3c c': {
                topic: server.isValid({ x: 204, y: 380, c: '1a2b3c', oldX: 203, oldY: 300, t: '0' })
                ,'true expected': assertTrue
            }
            ,'1a2b3c4 c': {
                topic: server.isValid({ x: 204, y: 380, c: '1a2b3c4', oldX: 203, oldY: 300, t: '0' })
                ,'false expected': assertFalse
            }
            ,'1a2b3 c': {
                topic: server.isValid({ x: 204, y: 380, c: '1a2b3', oldX: 203, oldY: 300, t: '0' })
                ,'false expected': assertFalse
            }
            ,'blah34 c': {
                topic: server.isValid({ x: 204, y: 380, c: 'blah34', oldX: 203, oldY: 300, t: '0' })
                ,'false expected': assertFalse
            }
        }
    )
    .export(module)
;
