'use strict';
var
Legio = require("legio"),
Promise = require("./promise");

/** @module legio-async */

/** @alias module:legio-async */
var Async = {
  /**
   * Wraps a node-async-style function so it can return a promise.
   * @param {Function} fn
   * @param {*} [that] The `this` argument passed to `fn`
   * @returns {Function} A function which returns a promise.
   */
  denodeify: function (fn, that) {
    return function () {
      var prom = new Promise();

      fn.apply(that, Array.from(arguments).tack(prom.nodeifyResolve()));

      return prom;
    };
  }
};

module.exports = Async;
