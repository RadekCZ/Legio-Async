'use strict';
var
expect = require("expect.js"),
Promise = require("../promise"),
Interval = require("../interval");

describe("Interval", function () {
  it("wraps the native setInterval and clearInterval methods", function (done) {
    var
    inter = new Interval(
      function (n) {
        expect(this).to.be(inter);
        expect(val).to.be(42);

        if (n === 3) {
          inter.suspend();
          done();
        }
      },
      10
    ),
    val;

    inter.activate(true);

    val = 42;
  });
  it("can also use a promise using the notification method", function (done) {
    Interval.start(10, true)
      .notified(function (count) {
        if (count === 3) {
          throw "finish";
        }
      })
      .failed(function (err) {
        expect(err).to.be("finish");
        done();
      });
  });
});
