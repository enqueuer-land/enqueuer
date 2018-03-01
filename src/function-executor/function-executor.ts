export class FunctionExecutor {
    private passingTests: string[] = [];
    private failingTests: string[] = [];
    private reports: any = {};
    private exception: string = "";
    
    private functionToExecute: Function;
    private parameters: string[];
    private functionResponse: any;

    constructor(functionToExecute: Function, ...parameters: any[]) {
        this.parameters = parameters;
        this.functionToExecute = functionToExecute;
    }
    
    public execute() {
        try {
            this.functionResponse = this.functionToExecute(this.parameters);
            for (const test in this.functionResponse.test) {
                if (this.functionResponse.test[test]) {
                    this.passingTests.push(test);
                } else {
                    this.failingTests.push(test);
                }
            }
            for (const report in this.functionResponse.report) {
                this.reports[report] = this.functionResponse.report[report];
            }
        } catch (exc) {
            this.exception = exc;
        }
    }

    public getFunctionResponse(): any {
        return this.functionResponse;
    }

    public getPassingTests(): string[] {
        return this.passingTests;
    }

    public getFailingTests(): string[] {
        return this.failingTests;
    }

    public getReports(): string[] {
        return this.reports;
    }

    public getException(): string {
        return this.exception;
    }
}