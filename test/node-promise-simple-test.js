var nodeunit = require('nodeunit');
var Promise = require('../promise-simple');

module.exports = nodeunit.testCase({
    'resolve': function(t) {
        var d1 = Promise.defer();
        t.equal(false, d1.isResolved());
        d1.resolve();
        t.equal(true, d1.isResolved());

        var d2 = Promise.defer();
        d2.reject();
        t.equal(false, d2.isResolved());

        t.done();
    },

    'reject': function(t) {
        var d1 = Promise.defer();
        t.equal(false, d1.isRejected());
        d1.reject();
        t.equal(true, d1.isRejected());

        var d2 = Promise.defer();
        d2.resolve();
        t.equal(false, d2.isRejected());

        t.done();
    },

    'next': function(t) {
        var callBackCount = 0;
        function listener() {
            callBackCount++;
        }

        var d1 = Promise.defer();
        d1.then(function() {
            listener();
            t.equal(1, callBackCount);
        })
        .next(function() {
            listener();
            t.equal(4, callBackCount);
        })
        .then(function() {
            listener();
            t.equal(5, callBackCount);
        })
        .next(function() {
            listener();
            t.equal(6, callBackCount);
            t.done();
        });

        var d2 = Promise.defer();
        d2.then(function() {
            listener();
            t.equal(2, callBackCount);
        })
        .then(function() {
            listener();
            t.equal(3, callBackCount);
        });

        d1.resolve();
        d2.resolve();
    },

    'when': function(t) {
        var d1 = Promise.defer()
        .then(function() {
            return 1;
        });

        var d2 = Promise.defer()
        .next(function() {
            return 2;
        });

        var obj1 = {a: 'a'};

        Promise.when(d1, d2, obj1)
        .then(function(results) {
            t.equal(3, results.length);
            t.equal(1, results[0]);
            t.equal(2, results[1]);
            t.equal('a', results[2].a);
            t.done();
        });

        var d3 = Promise.defer()
        .then(function() {
            throw Error('Error has occured');
        });

        Promise.when(d3)
        .then(
            function(results) {
            },
            function(error) {
                t.equal('Error has occured', error.message);
            }
        );
    }
});
