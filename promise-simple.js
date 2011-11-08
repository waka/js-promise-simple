/**
 * @fileoverview Simple implementation of CommonJS Promise/A.
 * @author yo_waka
 */
(function(define) {
define([], function() {
    
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
     * @type {Array.<>}
     * @private
     */
    Deferred.prototype.chain_;

    /**
     * @type {*}
     * @private
     */
    Deferred.prototype.result_;

    /**
     * @type {Object}
     * @private
     */
    Deferred.prototype.scope_;

    /**
     * @override
     */
    Deferred.prototype.then = function(callback, errback) {
        var deferred = new Deferred(this.scope_);
    };

    /**
     * @override
     */
    Deferred.prototype.resolve = function(value) {
        this.state_ = Deferred.State.RESOLVED;
    };

    /**
     * @override
     */
    Deferred.prototype.reject = function(error) {
        this.state_ = Deferred.State.REJECTED;
    };


    /**
     * @type {enum}
     */
    Deferred.State = {
        UNRESOLVED: 'unresolved',
        RESOLVED: 'resolved',
        REJECTED: 'rejected'
    };


    /**
     * @param {Array.<Function|Deferred>|Deferred|Function} args
     * @return {Deferred}
     * @static
     */
    Deferred.when = function(args) {
        var d = new Deferred();

        if (args instanceof Array) {
        } else if (args instanceof Deferred) {
        } else if (args instanceof Function) {
        } else {
            throw Error('Illegal arguments');
        }

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
    function(deps, factory) { this.when = factory(); }
);
