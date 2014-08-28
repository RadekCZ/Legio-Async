'use strict';
var
Promise = require("../promise");

module.exports = {
  resolved: function (val) {
    var prom = new Promise();
    prom.resolve(val);

    return prom;
  },
  rejected: function (val) {
    var prom = new Promise();
    prom.reject(val);

    return prom;
  },
  deferred: function () {
    var prom = new Promise();

    return {
      promise: prom,
      resolve: prom.bindResolve(),
      reject: prom.bindReject()
    };
  }
};
