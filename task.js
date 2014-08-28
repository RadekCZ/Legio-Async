'use strict';
var
Legio = require("legio");
require("setimmediate");

/** @module legio-async/task */

/** @alias module:legio-async/task */
var Task = {
  /**
   * Runs the given function asynchronously.
   * @param {Function} fn
   */
  run: function (fn) {
    global.setImmediate(fn);
  }
};

module.exports = Task;
