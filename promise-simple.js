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
     * Interface Promise/A.
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
     * @param {!Function} fn
     * @param {number=} opt_interval
     * @return {Deferred}
     */
    Deferred.prototype.next = function(fn, opt_interval) {
        var timerId = null;
        var interval = opt_interval || 10;

        // create async deferred.
        var nextDeferred = new Deferred(this);
        nextDeferred.then(fn);

        // Add in original callback chain
        this.then(function() {
            var self = this;
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
        var res = (typeof value !== 'undefined') ? value : this.result_;

        while(this.chain_.length) {
            var entry = this.chain_.shift();
            var fn = (this.state_ === Deferred.State.REJECTED) ? entry[1] : entry[0];
            if (fn) {
                try {
                    this.result_ = res = fn.call(this.scope_, res);
                } catch (e) {
                    this.state_ = Deferred.State.REJECTED;
                    this.result_ = res = e;
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
     * @param {...*} var_args
     * @return {Deferred}
     * @static
     */
    Deferred.when = function(var_args) {
        var d = new Deferred();
        var results = [];

        [].slice.call(arguments, 0).forEach(function(arg) {
            if (Deferred.isPromise(arg)) {
                d = d.chainDeferred(arg);
            } else if (arg instanceof Function) {
                arg.then(function(result) {
                    results.push(result);
                });
            } else {
                d = d.then(function(res) {
                    return arg;
                });
            }
        });

        return d;
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
