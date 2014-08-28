'use strict';
var
Legio = require("legio"),
construct = require("legio/construct"),
Task = require("./task");

/** @module legio-async/promise */

/**
 * @constructor
 * @alias module:legio-async/promise
 */
var Promise = construct({
  init: function () {
    this.onFulfilledHandlers = [];
    this.onRejectedHandlers = [];
    this.onNotifiedHandlers = [];

    this.promises = [];
  },

  /** @lends module:legio-async/promise.prototype */
  proto: {
    /** @type {Boolean} */
    pending: true,
    /** @type {Thenable} */
    awaiting: null,
    /** @type {Boolean} */
    fulfilled: false,
    /** @type {Boolean} */
    rejected: false,

    /**
     * @param {Function} [onFulfilled]
     * @param {Function} [onRejected]
     * @returns {Promise}
     */
    then: function (onFulfilled, onRejected) {
      var prom = new Promise();

      // On fulfilled
      if (!Function.is(onFulfilled)) {
        onFulfilled = function (val) {
          prom.fulfill(val);
        };
      }
      if (this.pending) {
        this.onFulfilledHandlers.push(onFulfilled);
      }
      else if (this.fulfilled) {
        Task.run(this.runHandler.bind(this, onFulfilled, prom, this.value));
      }

      // On rejected
      if (!Function.is(onRejected)) {
        onRejected = function (val) {
          prom.reject(val);
        };
      }
      if (this.pending) {
        this.onRejectedHandlers.push(onRejected);
      }
      else if (this.rejected) {
        Task.run(this.runHandler.bind(this, onRejected, prom, this.value));
      }

      if (this.pending) {
        this.promises.push(prom);
      }

      return prom;
    },

    /**
     * @param {Function} onRejected
     * @returns {Promise}
     */
    failed: function (handler) {
      return this.then(null, handler);
    },

    /**
     * @param {Function} onSettled
     * @returns {Promise}
     */
    settled: function (handler) {
      return this.then(handler, handler);
    },

    /**
     * @param {Function} onNotified
     * @returns {this}
     */
    notified: function (onNotified) {
      if (Function.is(onNotified) && this.pending) {
        this.onNotifiedHandlers.push(onNotified);
      }

      return this;
    },

    /**
     * @param {*} value
     * @returns {Boolean} A boolean indicating whether the promise was fulfilled.
     */
    fulfill: function (val) {
      if (this.pending && !this.awaiting) {
        this.pending = false;
        this.fulfilled = true;
        this.value = val;

        this.emitEvent(this.onFulfilledHandlers, val);
        this.clear();

        return true;
      }
      return false;
    },

    /**
     * @param {*} reason
     * @returns {Boolean} A boolean indicating whether the promise was rejected.
     */
    reject: function (val) {
      if (this.pending && !this.awaiting) {
        this.pending = false;
        this.rejected = true;
        this.value = val;

        this.emitEvent(this.onRejectedHandlers, val);
        this.clear();

        return true;
      }
      return false;
    },

    adoptState: function (thenable, then, isPromise) {
      var
      self = this,
      resolve = isPromise ? this.fulfill : this.resolve;

      this.awaiting = thenable;

      then.call(
        thenable,
        function (val) {
          if (self.awaiting === thenable) {
            self.awaiting = null;
            resolve.call(self, val);
          }
        },
        function (val) {
          if (self.awaiting === thenable) {
            self.awaiting = null;
            self.reject(val);
          }
        }
      );
    },

    /**
     * @param {*} x
     */
    resolve: function (val) {
      if (this.awaiting) {
        return;
      }

      if (this === val) {
        this.reject(new TypeError("Can't resolve a promise with the same promise!"));
        return;
      }

      if (val) {
        if (val instanceof Promise) {
          this.adoptState(val, val.then, true);
          return;
        }

        if ((Object.isAny(val) || Function.is(val))) {
          try {
            var then = val.then;
            if (Function.is(then)) {
              this.adoptState(val, then);
              return;
            }
          }
          catch (ex) {
            if (this.awaiting === val) {
              this.awaiting = null;
            }
            this.reject(ex);
            return;
          }
        }
      }

      this.fulfill(val);
    },

    /**
     * @param {*} value
     * @returns {Boolean} A boolean indicating whether the promise was notified.
     */
    notify: function (val) {
      if (this.pending) {
        this.emitEvent(this.onNotifiedHandlers, val, true);

        return true;
      }
      return false;
    },

    /**
     * @returns {Function}
     */
    bindFulfill: function () {
      return this.fulfill.bindList(this, arguments);
    },

    /**
     * @returns {Function}
     */
    bindReject: function () {
      return this.reject.bindList(this, arguments);
    },

    /**
     * @returns {Function}
     */
    bindResolve: function () {
      return this.resolve.bindList(this, arguments);
    },

    /**
     * @returns {Function}
     */
    bindNotify: function () {
      return this.notify.bindList(this, arguments);
    },

    emitEvent: function (handlers, val, notification) {
      var self = this, promises = this.promises;
      Task.run(function () {
        for (var i = 0, j = handlers.length; i < j; ++i) {
          self.runHandler(handlers[i], notification ? self : promises[i], val, notification);
        }
      });
    },
    runHandler: function (handler, promise, val, notification) {
      var hasPromise = promise instanceof Promise;

      try {
        var res = handler(val);

        if (!notification && hasPromise) {
          promise.resolve(res);
        }
      }
      catch (ex) {
        if (hasPromise) {
          promise.reject(ex);
        }
      }
    },

    clear: function () {
      delete this.onFulfilledHandlers;
      delete this.onRejectedHandlers;
      delete this.onNotifiedHandlers;

      delete this.promises;
    },

    /**
     * @param {Function} fn A function in the node-async-style form (err, res)
     * @returns {Promise}
     */
    nodeifyThen: function (fn) {
      return this.then(
        function (val) {
          fn(null, val);
        },
        function (err) {
          fn(err);
        }
      );
    },

    /**
     * Returns a function in the node-async-style form which when called resolves the promise
     * @returns {Function}
     */
    nodeifyResolve: function () {
      var self = this;
      return function (err, res) {
        if (err) {
          self.reject(err);
          return;
        }

        self.fulfill(res);
      };
    }
  },

  /** @lends module:legio-async/promise */
  own: {
    /**
     * @param {Promise[]} list
     * @returns {Promise}
     */
    all: function (list, awaitResolution) {
      var
      wrapper = new Promise(),

      len, count, res,

      rejected = false, reason,

      resolve = function () {
        if (wrapper.pending && --count === 0) {
          if (rejected) {
            wrapper.reject(reason);
          }
          else {
            wrapper.fulfill(res);
          }
        }
      },
      tryFulfill = function (key, val) {
        res[key] = val;

        resolve();
      },
      reject = awaitResolution ? function (err) {
        rejected = true;
        reason = err;

        resolve();
      } : wrapper.bindReject();

      if (Array.is(list)) {
        count = len = list.length;
        res = [];

        for (var i = 0; i < len; ++i) {
          list[i].then(tryFulfill.bind(null, i), reject);
        }
      }
      else {
        var keys = Object.keys(list);

        count = len = keys.length;
        res = {};

        for (var i = 0; i < len; ++i) {
          var key = keys[i];

          list[key].then(tryFulfill.bind(null, key), reject);
        }
      }

      return wrapper;
    },

    /**
     * @param {Promise[]} list
     * @returns {Promise}
     */
    allSettled: function (list) {
      return Promise.all(list, true);
    },

    /**
     * @param {Thenable} thenable
     * @returns {Promise}
     */
    when: function (thenable) {
      var prom = new Promise();

      prom.resolve(thenable);

      return prom;
    }
  }
});

var PromiseProto = Promise.prototype;

/**
 * Alias for {@link module:legio-async/promise#then}
 * @alias module:legio-async/promise#done
 * @function
 */
PromiseProto.done = PromiseProto.then;

/**
 * Alias for {@link module:legio-async/promise#failed}
 * @alias module:legio-async/promise#catch
 * @function
 */
PromiseProto["catch"] = PromiseProto.failed;

/**
 * Alias for {@link module:legio-async/promise#settled}
 * @alias module:legio-async/promise#finally
 * @function
 */
PromiseProto["finally"] = PromiseProto.settled;

module.exports = Promise;
