import {Subscription} from "../service/requisition/subscription/subscription";

export class SubscriptionOnMessageReceivedExecutor {
    private passingTests: string[] = [];
    private failingTests: string[] = [];
    private reports: any = {};
    private warning: string = "";
    
    private subscriptionFunction: Function | null = null;
    private message: any;

    constructor(subscription: Subscription) {
        this.subscriptionFunction = subscription.createOnMessageReceivedFunction();
        this.message = subscription.message;
    }
    
    public execute() {
        if (this.subscriptionFunction == null)
            return;
        
        try {
            const functionResponse = this.subscriptionFunction(this.message);
            for (const test in functionResponse.test) {
                if (functionResponse.test[test]) {
                    this.passingTests.push(test);
                } else {
                    this.failingTests.push(test);
                }
            }
            console.log("Reports: "  + JSON.stringify(functionResponse));
            for (const report in functionResponse.report) {
                this.reports[report] = functionResponse.report[report];
            }
        } catch (exc) {
            this.warning = exc;
        }
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

    public getWarning(): string {
        return this.warning;
    }
}