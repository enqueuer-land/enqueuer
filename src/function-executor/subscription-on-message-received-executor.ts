import { Subscription } from "../mqtt/model/mqtt-requisition";

export class SubscriptionOnMessageReceivedExecutor {
    private passingTests: string[] = [];
    private failingTests: string[] = [];

    constructor(subscription: Subscription, message: any) {
        let subscriptionFunction = subscription.createTestFunction();
        if (subscriptionFunction == null)
            return;
        this.execute(subscriptionFunction, message);
    }

    private execute(subscriptionFunction: Function, message: any) {
        const functionResponse = subscriptionFunction(message);
        for (const test in functionResponse) {
            if (functionResponse[test]) {
                this.passingTests.push(test);
            } else {
                this.failingTests.push(test);
            }
        }
    }

    public getPassingTests(): string[] {
        return this.passingTests;
    }

    public getFailingTests(): string[] {
        return this.failingTests;
    }
}