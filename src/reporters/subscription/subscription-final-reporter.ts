import {TestModel} from '../../models/outputs/test-model';

export class SubscriptionFinalReporter {
    private messageReceivedTestName: string = `Message received`;
    private subscriptionAvoidedTestName: string = `Subscription avoided`;
    private noTimeOutTestName: string = `No time out`;
    private subscribedTestName: string = `Subscribed`;

    private subscribed: boolean;
    private avoidable: boolean;
    private hasMessage: boolean = false;
    private hasTimedOut: boolean;

    constructor(subscribed: boolean, avoidable: boolean, hasMessage: boolean, hasTimedOut: boolean) {
        this.subscribed = subscribed;
        this.avoidable = avoidable;
        this.hasMessage = hasMessage;
        this.hasTimedOut = hasTimedOut;
    }

    public getReport(): TestModel[] {
        if (!this.subscribed) {
            return this.createNotSubscribedTests();
        }
        let tests: TestModel[] = [];
        if (this.avoidable) {
            tests = tests.concat(this.createAvoidableTests());
        } else {
            tests = tests.concat(this.createMessageTests());
        }
        return tests.concat(this.addTimeoutTests());
    }

    private addTimeoutTests(): TestModel[] {
        if (this.hasTimedOut) {
            return this.createTimeoutTests();
        }
        return [];
    }

    private createNotSubscribedTests(): TestModel[] {
        return [{
            valid: false,
            name: this.subscribedTestName,
            description: `Subscription is not able to connect`
        }];
    }

    private createMessageTests(): TestModel[] {
        if (this.hasMessage) {
            return [{
                valid: true,
                name: this.messageReceivedTestName,
                description: `Subscription has received its message`
            }];
        } else {
            return [{
                valid: false,
                name: this.messageReceivedTestName,
                description: `Subscription has not received its message`
            }];
        }
    }
    private createTimeoutTests(): TestModel[] {
        if (!this.avoidable) {
            return [{
                valid: false,
                name: this.noTimeOutTestName,
                description: `Not avoidable Subscription has timed out`
            }];
        }
        return [];
    }

    private createAvoidableTests(): TestModel[] {
        if (this.hasMessage) {
            return [{
                valid: false,
                name: this.subscriptionAvoidedTestName,
                description: `Avoidable subscription should not receive a message`
            }];
        } else {
            return [{
                valid: true,
                name: this.subscriptionAvoidedTestName,
                description: `Avoidable subscription has not received a message`
            }];
        }
    }
}
