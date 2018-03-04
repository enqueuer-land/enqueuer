import {FunctionCreator} from "./function-creator";

export class FunctionExecutor {
    private functionToExecute: Function;
    private parameters: string[];

    constructor(functionBodyCreator: FunctionCreator, ...parameters: any[]) {
        this.parameters = parameters;
        this.functionToExecute = functionBodyCreator.createFunction();
    }

    public execute(): any {
        try {
            let functionResponse = this.functionToExecute(this.parameters);
            functionResponse.report = {
                passingTests: [],
                failingTests: [],
                reports: []
            }
            for (const test in functionResponse.test) {
                if (functionResponse.test[test]) {
                    functionResponse.report.passingTests.push(test);
                } else {
                    functionResponse.report.failingTests.push(test);
                }
            }
            for (const report in functionResponse.report) {
                functionResponse.report.reports[report] = functionResponse.report[report];
            }
            return functionResponse;
        } catch (exc) {
            return exc;
        }
    }
}