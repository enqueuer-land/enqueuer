import {SubscriptionSuperClass} from "../service/requisition/subscription/subscription-super-class";
import {StartEvent} from "../service/requisition/start-event/start-event";

export class SubscriptionOnMessageReceivedExecutor {
    private passingTests: string[] = [];
    private failingTests: string[] = [];
    private reports: any = {};
    private warning: string = "";
    
    private startEvent: StartEvent;
    private subscriptionFunction: Function | null = null;
    private message: any;

    constructor(subscription: SubscriptionSuperClass, startEvent: any) {
        this.subscriptionFunction = subscription.createOnMessageReceivedFunction();
        this.startEvent = startEvent;
        this.message = subscription.message;
    }
    
    public execute() {
        if (this.subscriptionFunction == null)
            return;
        
        try {
            console.log("Start event: " + JSON.stringify(this.startEvent.payload));
            const functionResponse = this.subscriptionFunction(this.message, this.startEvent.payload);
            for (const test in functionResponse.test) {
                if (functionResponse.test[test]) {
                    this.passingTests.push(test);
                } else {
                    this.failingTests.push(test);
                }
            }
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