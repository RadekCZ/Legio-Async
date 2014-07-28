'use strict';
var
Legio = require("legio");
require("setimmediate");

var Task = {};

if (Function.is(global.setImmediate)) {
  Task.run = function (fn) {
    global.setImmediate(fn);
  };
}
else if (global.process && Function.is(process.nextTick)) {
  Task.run = function (fn) {
    process.nextTick(fn);
  };
}
else if (Function.is(global.setTimeout)) {
  Task.run = function (fn) {
    global.setTimeout(fn, 0);
  };
}

module.exports = Task;
