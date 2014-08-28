'use strict';
var
Legio = require("legio"),
construct = require("legio/construct"),
Promise = require("./promise"),
Task = require("./task");

/** @module legio-async/interval */

/**
 * @constructor
 * @alias module:legio-async/interval
 * @param {Function} fn If bound, the first arguments contains the count of executions.
 * @param {Number} time
 * @param {Boolean} [wrap=true] Indicates if the given function should be bound to the interval object.
 */
var Interval = construct({
  init: function (func, time, wrap) {
    var self = this;

    this.count = 0;
    this.callback = wrap === false ? func : function () {
      func.call(self, ++self.count);
    };

    this.time = time;
  },

  /** @lends module:legio-async/interval.prototype */
  proto: {
    /**
     * @param {Boolean} [immediately=false]
     * @param {Number} [time=this.time]
     */
    activate: function (immediately, time) {
      time === undefined && (time = this.time);

      if (immediately) {
        Task.run(this.callback);
      }
      this.id = global.setInterval(this.callback, time);
    },

    /**
     * Clears the interval.
     */
    suspend: function () {
      global.clearInterval(this.id);
    }
  },

  /** @lends module:legio-async/interval */
  own: {
    /**
     * @param {Number} time
     * @param {Boolean} [immediately=false]
     * @returns {Promise}
     */
    start: function (time, immediately) {
      var
      prom = new Promise(),
      inter = new Interval(prom.bindNotify(), time);

      prom.settled(function () {
        inter.suspend();
      });

      inter.activate(immediately);

      return prom;
    }
  }
});

module.exports = Interval;
