/**
 * promise-simple
 * copyright(c) 2013 Yoshimasa Wakahara <y.wakahara@gmail.com>
 * MIT Licensed
 */

'use strict';


/**
 * Module dependencies
 */

var assert = require('assert');
var Promise = require('../promise-simple');


describe('Promise', function() {

  it('resolve', function(done) {
    var d1 = Promise.defer();
    assert.equal(false, d1.isResolved(), 'must be unresolved');
    d1.resolve();
    assert.equal(true, d1.isResolved(), 'must be resolved');

    var d2 = Promise.defer();
    d2.reject();
    assert.equal(false, d2.isResolved(), 'must be rejected');

    done();
  });

  it('reject', function(done) {
    var d1 = Promise.defer();
    assert.equal(false, d1.isRejected(), 'must be unresolved');
    d1.reject();
    assert.equal(true, d1.isRejected(), 'must be rejected');

    var d2 = Promise.defer();
    d2.resolve();
    assert.equal(false, d2.isRejected(), 'must be resolved');

    done();
  });

  it('next', function(done) {
    var callBackCount = 0;
    function listener() {
      callBackCount++;
    }

    var d1 = Promise.defer();
    d1.then(function() {
      listener();
      assert.equal(1, callBackCount);
    })
    .next(function() {
      listener();
      assert.equal(4, callBackCount);
    })
    .then(function() {
      listener();
      assert.equal(5, callBackCount);
    })
    .next(function() {
      listener();
      assert.equal(6, callBackCount);
      
      done();
    });

    var d2 = Promise.defer();
    d2.then(function() {
      listener();
      assert.equal(2, callBackCount);
    })
    .then(function() {
      listener();
      assert.equal(3, callBackCount);
    });

    d1.resolve();
    d2.resolve();
  });

  it('when', function(done) {
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
      assert.equal(3, results.length);
      assert.equal(1, results[0]);
      assert.equal(2, results[1]);
      assert.equal('a', results[2].a);

      done();
    });

    var d3 = Promise.defer()
    .then(function() {
      throw Error('Error has occured');
    });

    Promise.when(d3)
    .then(
      function(results) {
      },
      function(err) {
        assert.equal('Error has occured', err.message);
      }
    );
  });

});
