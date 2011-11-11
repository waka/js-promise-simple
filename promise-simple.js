/**
 * @fileoverview Simple implementation of CommonJS Promise/A.
 * @author yo_waka
 */
(function(define) {
define([], function() {

    'use strict';

    // Use freeze if exists.
    var freeze = Object.freeze || function() {};

    
    /**
     * Promise/A interface.
     * @interface
     */
    var Promise = function() {};

    /**
     * @param {*} value
     */
    Promise.prototype.resolve;

    /**
     * @param {*} error
     */
    Promise.prototype.reject;

    /**
     * @param {Function} callback
     * @param {Function} errback
     */
    Promise.prototype.then;


    /**
     * Implemented Promise/A interface.
     *
     * @param {*=} opt_scope
     * @constructor
     * @implements {Promise}
     */
    var Deferred = function(opt_scope) {
        this.state_ = Deferred.State.UNRESOLVED;
        this.chain_ = [];
        this.scope_ = opt_scope || null;
    };

    /**
     * @type {Deferred.State}
     * @private
     */
    Deferred.prototype.state_;

    /**
     * @type {!Array.<!Array>}
     * @private
     */
    Deferred.prototype.chain_;

    /**
     * @type {Object}
     * @private
     */
    Deferred.prototype.scope_;

    /**
     * The current Deferred result.
     * @type {*}
     * @private
     */
    Deferred.prototype.result_;

    /**
     * @override
     */
    Deferred.prototype.then = function(callback, errback, progback) {
        this.chain_.push([callback || null, errback || null, progback || null]);
        if (this.state_ !== Deferred.State.UNRESOLVED) {
            this.fire_();
        }
        return this;
    };

    /**
     * @override
     */
    Deferred.prototype.resolve = function(value) {
        this.state_ = Deferred.State.RESOLVED;
        this.fire_(value);
    };

    /**
     * @override
     */
    Deferred.prototype.reject = function(error) {
        this.state_ = Deferred.State.REJECTED;
        this.fire_(error);
    };

    /**
     * @return {boolean}
     */
    Deferred.prototype.isResolved = function() {
        return this.state_ === Deferred.State.RESOLVED;
    };

    /**
     * @return {boolean}
     */
    Deferred.prototype.isRejected = function() {
        return this.state_ === Deferred.State.REJECTED;
    };

    /**
     * Create async deferred chain.
     *
     * @param {Function} callback
     * @param {Function} callback
     * @param {number=} opt_interval
     * @return {Deferred}
     */
    Deferred.prototype.next = function(callback, errback, opt_interval) {
        var timerId = null;
        var interval = opt_interval || 10;

        // create async deferred.
        var nextDeferred = new Deferred(this);
        nextDeferred.then(callback, errback);

        // Add in original callback chain
        var self = this;
        this.then(function() {
            timerId = setTimeout(function() {
                nextDeferred.resolve(self.result_);
            }, interval);
        });

        return nextDeferred;
    };


    /**
     * @param {*} value
     * @private
     */
    Deferred.prototype.fire_ = function(value) {
        this.result_ = (typeof value !== 'undefined') ? value : this.result_;

        while(this.chain_.length) {
            var entry = this.chain_.shift();
            var fn = (this.state_ === Deferred.State.REJECTED) ? entry[1] : entry[0];
            if (fn) {
                try {
                    this.result_ = fn.call(this.scope_, this.result_);
                } catch (e) {
                    this.state_ = Deferred.State.REJECTED;
                    this.result_ = e;
                }
            }
        }
    };


    /**
     * @type {enum}
     */
    Deferred.State = {
        UNRESOLVED: 'unresolved',
        RESOLVED: 'resolved',
        REJECTED: 'rejected'
    };
    freeze(Deferred.State);


    /**
     * @return {boolean}
     * @static
     */
    Deferred.isPromise = function(arg) {
        return (arg && typeof arg.then === 'function');
    };

    /**
     * @param {..*} var_args
     * @return {Deferred}
     * @static
     */
    Deferred.when = function(var_args) {
        var deferred = new Deferred();
        var args = [].slice.call(arguments, 0);
        var results = [];

        var callback = function(value) {
            results.push(value);
            if (args.length === results.length) {
                deferred.resolve(results);
            }
        };

        var errback = function(error) {
            deferred.reject(error);
        };

        for (var i = 0, len = args.length; i < len; i++) {
            var arg = args[i];
            if (Deferred.isPromise(arg)) {
                arg.then(callback, errback).resolve();
            } else if (arg instanceof Function) {
                (new Deferred())
                .then(arg)
                .then(callback, errback)
                .resolve();
            } else {
                (new Deferred())
                .then(function() {
                    return arg;
                })
                .then(callback, errback)
                .resolve();
            }
        };

        return deferred;
    };

    
    return /* @type {Deferred} */Deferred;

}); // define
})(typeof define !== 'undefined' ?
    // use define for AMD if available
    define :
    // If no define, look for module to export as a CommonJS module.
    // If no define or module, attach to current context.
    typeof module !== 'undefined' ?
    function(deps, factory) { module.exports = factory(); } :
    function(deps, factory) { this.Deferred = factory(); }
);
