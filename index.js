'use strict';
var
Legio = require("legio"),
Promise = require("./promise");

var Async = {
  denodeify: function (fn, that) {
    return function () {
      var prom = new Promise();

      fn.apply(that, Array.from(arguments).tack(prom.nodeifyResolve()));

      return prom;
    };
  }
};

module.exports = Async;
