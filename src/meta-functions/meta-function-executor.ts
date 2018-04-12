import {MetaFunctionCreator} from "./meta-function-creator";

export class MetaFunctionExecutor {
    private functionToExecute: Function;
    private parameters: string[];

    constructor(functionBodyCreator: MetaFunctionCreator, ...parameters: any[]) {
        this.functionToExecute = functionBodyCreator.createFunction();
        this.parameters = parameters;
    }

    public execute(): any {
        try {
            let functionResponse = this.functionToExecute(this.parameters);
            let result: any = Object.assign({}, functionResponse);
            delete result.test;
            delete result.report;

            result.passingTests = [];
            result.failingTests = [];
            result.reports = {};

            for (const test in functionResponse.test) {
                if (functionResponse.test[test]) {
                    result.passingTests.push(test);
                } else {
                    result.failingTests.push(test);
                }
            }
            for (const report in functionResponse.report) {
                result.reports[report] = functionResponse.report[report];
            }
            return result;
        } catch (exc) {
            return { exception: {
                "Function runtime error": exc
            } };
        }
    }
}