var assert = require('assert');
var Deferred = require('../promise-simple');


function test() {
    var cnt = 0;
    
    var d = new Deferred();
    d.then(function() {
        cnt++;
        assert.equal(cnt, 3);
    });
    cnt++;
    assert.equal(cnt, 1);
    d.resolve();
};

test();
