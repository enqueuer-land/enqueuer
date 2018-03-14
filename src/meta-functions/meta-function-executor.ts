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
            return { report: {
                exc: exc
            } };
        }
    }
}