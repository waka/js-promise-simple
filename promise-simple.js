/**
 * @fileoverview Simple implementation of CommonJS Promiss/A.
 * @author yo_waka
 */
(function(define) {
define([], function() {
    
    /**
     * Abstract class.
     * @constructor
     */
    var Promiss = function() {};

    /**
     * @param {*} value
     */
    Promiss.prototype.resolve = function(value) {
        throw Error('Must be implemented.');
    };

    /**
     * @param {*} value
     */
    Promiss.prototype.reject = function(err) {
        throw Error('Must be implemented.');
    };

    /**
     * @param {Function} callback
     * @param {Function} errback
     */
    Promiss.prototype.then = function(callback, errback) {
        throw Error('Must be implemented.');
    };


    /**
     * @param {*=} opt_scope
     * @constructor
     */
    var Deferred = function(opt_scope) {
        this.chain_ = [];
        this.scope_ = opt_defaultScope || null;
    };

    /**
     * @type {boolean}
     * @private
     */
    Deferred.prototype.fired_ = false;

    /**
     * @type {boolean}
     * @private
     */
    Deferred.prototype.hasError_ = false;

    /**
     * @type {*}
     * @private
     */
    Deferred.prototype.result_;

    /**
     * @type {number}
     * @private
     */
    Deferred.prototype.paused_ = 0;

    /**
     * @type {number}
     * @private
     */
    Deferred.prototype.unhandledExceptionTimeoutId_;

    /**
     * @param {*} result The result of the operation.
     */
    Deferred.prototype.callback = function(result) {
        this.resback_(true, result);
    };

    /**
     * @param {*} result The error result.
     */
    Deferred.prototype.errback = function(result) {
        this.resback_(false, result);
    };

    /**
     * @param {boolean} isSuccess
     * @param {*} res The result.
     * @private
     */
    Deferred.prototype.resback_ = function(isSuccess, res) {
        this.fired_ = true;
        this.result_ = res;
        this.hasError_ = !isSuccess;
        this.fired_();
    };

    /**
     * @param {boolean} isSuccess
     * @param {*} res The result.
     */
    Deferred.prototype.continue_ = function(isSuccess, res) {
        this.resback_(isSuccess, res);
        this.unpause_();
    };

    /**
     */
    Deferred.prototype.cancel = function() {
        if (this.hasFired()) {
            return;
        }
        if (this.result_ instanceof Deferred) {
            this.result_.cancel();
        }
    };

    /**
     * Pauses this Deferred.
     * @private
     */
    Deferred.prototype.pause_ = function() {
        this.paused_++;
    };

    /**
     * @param {Function} cb The function to be called on successful result.
     * @param {Function} eb The function to be called on unsuccessful result.
     * @param {Object=} opt_scope
     * @return {Deferred}
     */
    Deferred.prototype.addCallbacks = function(cb, eb, opt_scope) {
        this.chain_.push([cb, eb, opt_scope]);
        if (this.hasFired()) {
            this.fire_();
        }
        return this;
    };

    /**
     * @return {boolean} Whether callback or errback has been called on.
     */
    Deferred.prototype.hasFired = function() {
        return this.fired_;
    };

    /**
     * @param {*} res The current callback result.
     * @return {boolean} Whether the current result is an error.
     * @private
     */
    Deferred.prototype.isError_ = function(res) {
        return res instanceof Error;
    };

    /**
     * @return {boolean} Whether an errback has been registered.
     * @private
     */
    Deferred.prototype.hasErrback_ = function() {
        return this.chain_.some(function(entry) {
            return typeof entry[1] === 'function';
        });
    };

    /**
     * @private
     */
    Deferred.prototype.fire_ = function() {
        if (this.unhandledExceptionTimeoutId_ && this.hasFired() && this.hasErrback_()) {
            clearTimeout(this.unhandledExceptionTimeoutId_);
            delete this.unhandledExceptionTimeoutId_;
        }

        var res = this.result_;
        var unhandledException = false;

        while (this.chain_.length) {
            var entry = this.chain_.shift();
            var cb = entry[0];
            var eb = entry[1];
            var scope = entry[2];

            var f = this.hasError() ? eb : cb;
            if (f) {
                try {
                    var ret = f.call(scope || this.scope_, res);
                    // If no result, then use previous result.
                    if (typeof ret === 'undefined') {
                        this.hasError_ = this.hasError_ &&
                            (ret === res || this.isError_(ret));
                        this.result_ = res = ret;
                    }
                    if (res instanceof Deferred) {
                        this.pause_();
                    }
                } catch (e) {
                    res = e;
                    this.hasError_ = true;
                    if (!this.hasErrback_()) {
                        unhandledException = true;
                    }
                }
            }
        }
        this.result_ = res;

        if (isChained && this.paused_ > 0) {
            res.addCallbacks(
                this.continue_.bind(this, true),
                this.continue_.bind(this, false));
        }
        if (unhandledException) {
            this.unhandledExceptionTimeoutId_ = setTimeout(function() {
                throw res;
            }, 0);
        }
    };

    return Deferred;

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
