"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MetaFunctionExecutor {
    constructor(functionBodyCreator, ...parameters) {
        this.functionToExecute = functionBodyCreator.createFunction();
        this.parameters = parameters;
    }
    execute() {
        try {
            let functionResponse = this.functionToExecute(this.parameters);
            let result = Object.assign({}, functionResponse);
            delete result.test;
            delete result.report;
            result.passingTests = [];
            result.failingTests = [];
            result.reports = {};
            for (const test in functionResponse.test) {
                if (functionResponse.test[test]) {
                    result.passingTests.push(test);
                }
                else {
                    result.failingTests.push(test);
                }
            }
            for (const report in functionResponse.report) {
                result.reports[report] = functionResponse.report[report];
            }
            return result;
        }
        catch (exc) {
            return { exception: {
                    "Function runtime error": exc
                } };
        }
    }
}
exports.MetaFunctionExecutor = MetaFunctionExecutor;
