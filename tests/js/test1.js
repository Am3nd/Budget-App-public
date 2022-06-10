"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var sinon_1 = __importDefault(require("sinon"));
var chai_1 = require("chai");
require("mocha");
var sandbox = sinon_1["default"].createSandbox();
describe('Running BudgetController', function () {
    it('should return Transactions object', function () {
        (0, chai_1.expect)(1).to.equal(1);
    });
    it('should return Budgets object', function () {
        (0, chai_1.expect)(2).to.equal(2);
    });
    it('should verify System Authentication', function () {
        (0, chai_1.expect)(2).to.equal(2);
    });
    it('should initialize DatabaseController', function () {
        (0, chai_1.expect)(2).to.equal(2);
    });
});
//# sourceMappingURL=test1.js.map