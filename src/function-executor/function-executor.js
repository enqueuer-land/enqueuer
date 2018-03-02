"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FunctionExecutor = /** @class */ (function () {
    function FunctionExecutor(functionToExecute) {
        var parameters = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            parameters[_i - 1] = arguments[_i];
        }
        this.passingTests = [];
        this.failingTests = [];
        this.reports = {};
        this.exception = "";
        this.parameters = parameters;
        this.functionToExecute = functionToExecute;
    }
    FunctionExecutor.prototype.execute = function () {
        try {
            this.functionResponse = this.functionToExecute(this.parameters);
            for (var test_1 in this.functionResponse.test) {
                if (this.functionResponse.test[test_1]) {
                    this.passingTests.push(test_1);
                }
                else {
                    this.failingTests.push(test_1);
                }
            }
            for (var report in this.functionResponse.report) {
                this.reports[report] = this.functionResponse.report[report];
            }
        }
        catch (exc) {
            this.exception = exc;
        }
    };
    FunctionExecutor.prototype.getFunctionResponse = function () {
        return this.functionResponse;
    };
    FunctionExecutor.prototype.getPassingTests = function () {
        return this.passingTests;
    };
    FunctionExecutor.prototype.getFailingTests = function () {
        return this.failingTests;
    };
    FunctionExecutor.prototype.getReports = function () {
        return this.reports;
    };
    FunctionExecutor.prototype.getException = function () {
        return this.exception;
    };
    return FunctionExecutor;
}());
exports.FunctionExecutor = FunctionExecutor;
