'use strict';
var
expect = require("expect.js"),
Promise = require("../promise"),
Timeout = require("../timeout");

describe("Timeout", function () {
  it("wraps the native setTimeout and clearTimeout methods", function (done) {
    var
    t = new Timeout(
      function (n) {
        expect(this).to.be(t);
        expect(val).to.be(42);

        done();
      },
      10
    ),
    val;

    t.start();

    val = 42;
  });
  it("can also use a promise using the notification method", function (done) {
    Timeout.start(10)
      .then(function () {
        expect(val).to.be(42);
      });

    var val = 42;

    var t = Timeout.start(1000);

    t.then(
      function () {
        throw new Error("Unstopped timeout");
      },
      function (err) {
        expect(err).to.be("error");

        done();
      }
    );

    Timeout.start(20)
      .then(function () {
        t.reject("error");
      });
  });
});
