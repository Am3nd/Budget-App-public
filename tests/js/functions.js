"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.MyError = exports.run_func = exports.foo = exports.hello = exports.secondFunction = exports.onData = void 0;
var onData = function (input) {
    var value = (0, exports.secondFunction)();
    if (input == "error") {
        throw new MyError("errorzd");
    }
    return value;
};
exports.onData = onData;
var secondFunction = function () {
    return "sweet potatoes";
};
exports.secondFunction = secondFunction;
function hello() {
    return 'Hello World!';
}
exports.hello = hello;
var foo = function () {
    return exports.run_func();
};
exports.foo = foo;
var run_func = function () {
    return '1';
};
exports.run_func = run_func;
var MyError = /** @class */ (function (_super) {
    __extends(MyError, _super);
    function MyError(error) {
        return _super.call(this, error) || this;
    }
    return MyError;
}(Error));
exports.MyError = MyError;
//# sourceMappingURL=functions.js.map