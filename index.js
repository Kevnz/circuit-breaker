"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.CircuitBreaker = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var CircuitBreaker =
/*#__PURE__*/
function () {
  function CircuitBreaker(props) {
    _classCallCheck(this, CircuitBreaker);

    Object.assign(this, {
      times: 3,
      delay: 0,
      backoff: false,
      promised: false,
      callback: null
    }, props);
    this.timesToTry = this.times;
    this.timesRemaining = this.times;
  }

  _createClass(CircuitBreaker, [{
    key: "tryCall",
    value: function tryCall(methodToTry, resolve, reject) {
      var _this = this;

      this.timesRemaining--;

      if (this.timesRemaining == -1) {
        if (reject) {
          return reject();
        } else if (this.callback) {
          return this.callback(new Error('All Attempts Failed'));
        }

        return;
      }

      if (this.timesRemaining < -1) {
        throw new Error("Negative ".concat(this.timesRemaining, " Times Remaining"));
      }

      try {
        methodToTry();

        if (resolve) {
          return resolve();
        } else if (this.callback) {
          return this.callback();
        }
      } catch (e) {
        if (this.delay > 0) {
          var delay = this.backoff ? this.delay * (this.timesToTry - this.timesRemaining) : this.delay;
          return setTimeout(function () {
            return _this.tryCall(methodToTry, resolve, reject);
          }, this.delay);
        } else {
          return this.tryCall(methodToTry, resolve, reject);
        }
      }
    }
  }, {
    key: "tryPromise",
    value: function tryPromise(methodToTry, resolve, reject) {
      var _this2 = this;

      this.timesRemaining--;

      if (this.timesRemaining < 0) {
        if (reject) {
          return reject();
        } else if (this.callback) {
          return this.callback(new Error('All Attempts Failed'));
        }
      }

      if (this.timesRemaining < -1) {
        throw new Error("Negative ".concat(this.timesRemaining, " Times Remaining"));
      }

      methodToTry().then(function (result) {
        if (resolve) {
          resolve(result);
        } else if (_this2.callback) {
          _this2.callback(null, result);
        }
      }).catch(function (e) {
        if (_this2.delay > 0) {
          var delay = _this2.backoff ? _this2.delay * (_this2.timesToTry - _this2.timesRemaining) : _this2.delay;
          return setTimeout(function () {
            return _this2.tryCall(methodToTry, resolve, reject);
          }, _this2.delay);
        } else {
          return _this2.tryCall(methodToTry, resolve, reject);
        }
      });
    }
  }, {
    key: "execute",
    value: function execute(attempt) {
      var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};
      this.callback = callback;
      this.tryCall(attempt);
    }
  }, {
    key: "executeAsPromise",
    value: function executeAsPromise(attempt) {
      var _this3 = this;

      this.promised = true;
      return new Promise(function (resolve, reject) {
        _this3.tryCall(attempt, resolve, reject);
      });
    }
  }, {
    key: "executeAsync",
    value: function executeAsync(attempt) {
      var _this4 = this;

      this.promised = true;
      return new Promise(function (resolve, reject) {
        _this4.tryPromise(attempt, resolve, reject);
      });
    }
  }]);

  return CircuitBreaker;
}();

exports.CircuitBreaker = CircuitBreaker;
var _default = CircuitBreaker;
exports.default = _default;
