"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const variables_controller_1 = require("../variables/variables-controller");
const configuration_1 = require("../configurations/configuration");
const logger_1 = require("../loggers/logger");
let persistEnqueuerVariable = (name, value) => {
    const configuration = new configuration_1.Configuration();
    configuration.setFileVariable(name, value);
};
let persistSessionVariable = (name, value) => {
    variables_controller_1.VariablesController.sessionVariables()[name] = value;
};
let deleteEnqueuerVariable = (name) => {
    const configuration = new configuration_1.Configuration();
    configuration.deleteFileVariable(name);
};
class MetaFunctionExecutor {
    constructor(functionBodyCreator) {
        this.functionBody = functionBodyCreator.createBody();
    }
    execute() {
        try {
            let functionToExecute = new Function('persistEnqueuerVariable', 'persistSessionVariable', 'deleteEnqueuerVariable', this.functionBody);
            logger_1.Logger.trace(`Function to execute: ${functionToExecute.toString()}`);
            try {
                let functionResponse = functionToExecute((name, value) => persistEnqueuerVariable(name, value), (name, value) => persistSessionVariable(name, value), (name) => deleteEnqueuerVariable(name));
                let result = this.fillResponseAttributes(functionResponse);
                return result;
            }
            catch (exc) {
                logger_1.Logger.error(`Error running function: ${JSON.stringify(exc, null, 2)}`);
                return { exception: `Function runtime error ${exc}` };
            }
        }
        catch (exc) {
            logger_1.Logger.error(`Error creating function: ${JSON.stringify(exc, null, 2)}`);
            return { exception: `Function compile time error ${exc}` };
        }
    }
    fillResponseAttributes(functionResponse) {
        let result = Object.assign({}, functionResponse);
        delete result.test;
        delete result.report;
        result.tests = [];
        for (const title in functionResponse.test) {
            result.tests.push({ name: title, valid: functionResponse.test[title] });
        }
        result.report = this.fillReportAttribute(functionResponse);
        return result;
    }
    fillReportAttribute(functionResponse) {
        let reports = {};
        for (const report in functionResponse.report) {
            reports[report] = functionResponse.report[report];
        }
        return reports;
    }
}
exports.MetaFunctionExecutor = MetaFunctionExecutor;
