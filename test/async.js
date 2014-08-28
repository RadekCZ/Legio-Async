'use strict';
var
expect = require("expect.js"),
Promise = require("../promise"),
Async = require("../index"),
Task = require("../task");

describe("Async", function () {
  var nodeFn;

  before(function () {
    nodeFn = function (val, callback) {
      if (val) {
        Task.run(function () {
          callback(null, true);
        });
      }
      else {
        Task.run(function () {
          callback(new Error());
        });
      }
    };
  });

  describe("denodeify", function () {
    it("wraps a node-async-style function so it can return a promise", function (done) {
      var promiseFn = Async.denodeify(nodeFn);

      promiseFn(true)
        .then(function (val) {
          expect(val).to.be(true);

          var prom = promiseFn(false);
          expect(prom).to.be.a(Promise);

          return prom;
        })
        .failed(function (err) {
          expect(err).to.be.an(Error);

          done();
        });
    });
  });

  describe("Promise#nodeifyThen", function (done) {
    it("converts a callback in (err, res) form and passes it to `then`", function () {
      var promiseFn = Async.denodeify(nodeFn);

      promiseFn(true)
        .nodeifyThen(function (err, res) {
          expect(err).to.be(null);
          expect(res).to.be(true);

          promiseFn(false)
            .nodeifyThen(function (err, res) {
              expect(err).to.be.an(Error);

              done();
            });
        });
    });
  });
});
