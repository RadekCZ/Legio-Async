'use strict';
var
Legio = require("legio"),
construct = require("legio/construct"),
Promise = require("./promise");

/** @module legio-async/timeout */

/**
 * @constructor
 * @alias module:legio-async/timeout
 * @param {Function} fn
 * @param {Number} time
 * @param {Boolean} [wrap=true] Indicates if the given function should be bound to the timeout object.
 */
var Timeout = construct({
  init: function (func, time, wrap) {
    this._func = wrap === false ? func : func.bind(this);
    this._time = time;
  },

  /** @lends module:legio-async/timeout.prototype */
  proto: {
    /**
     * @param {Number} [time=this.time]
     */
    start: function (time) {
      time === undefined && (time = this.time);

      this._id = global.setTimeout(this._func, time);
    },
    /**
     * Clears the timeout.
     */
    cancel: function () {
      global.clearTimeout(this._id);
    }
  },

  /** @lends module:legio-async/timeout */
  own: {
    /**
     * @param {Number} time
     * @returns {Promise}
     */
    start: function (time) {
      var
      prom = new Promise(),
      id = global.setTimeout(prom.bindFulfill(), time);

      prom.then(null, function () {
        global.clearTimeout(id);
      });

      return prom;
    }
  }
});

module.exports = Timeout;
