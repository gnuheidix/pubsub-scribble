var assert = require('assert')
    ,vows = require('vows')
//    ,server = require('../')
;

vows.describe('simple Hello World-Tests').addBatch({
  'verify a boolean': {
    topic: function(){return true},
    'result should be true': function (result) {
      assert.isBoolean(result);
      assert.equal(result, true);
    }
  }
}).export(module);
