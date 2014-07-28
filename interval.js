'use strict';
var
Legio = require("legio"),
construct = require("legio/construct"),
Promise = require("./promise"),
Task = require("./task");

var Interval = construct({
  init: function (func, time, wrap) {
    var self = this;

    this.count = 0;
    this.callback = wrap === false ? func : function () {
      func.call(self, ++self.count);
    };

    this.time = time;
  },

  proto: {
    activate: function (immediately, time) {
      time === undefined && (time = this.time);

      if (immediately) {
        Task.run(this.callback);
      }
      this.id = global.setInterval(this.callback, time);
    },
    suspend: function () {
      global.clearInterval(this.id);
    }
  },

  own: {
    start: function (time, immediately, that) {
      var
      prom = new Promise(that),
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
