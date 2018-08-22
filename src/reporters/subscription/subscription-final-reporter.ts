import {TestModel} from '../../models/outputs/test-model';

//TODO test it
export class SubscriptionFinalReporter {
    private messageReceivedTestName: string = `Message received`;

    private avoidable: boolean;
    private hasMessage: boolean = false;
    private hasTimedOut: boolean;

    constructor(avoidable: boolean, hasMessage: boolean, hasTimedOut: boolean) {
        this.avoidable = avoidable;
        this.hasMessage = hasMessage;
        this.hasTimedOut = hasTimedOut;
    }

    public getReport(): TestModel[] {
        let tests: TestModel[] = [];
        tests = tests.concat(this.createMessageReport());
        if (this.hasTimedOut) {
            tests = tests.concat(this.createTimeoutReport());
        }
        return tests;
    }

    private createMessageReport(): TestModel {
        if (this.hasMessage) {
            return this.createMessageReceived();
        } else {
            return this.createMessageNotReceived();
        }
    }

    private createMessageReceived() {
        if (!this.avoidable) {
            return {
                valid: true,
                name: this.messageReceivedTestName,
                description: `Subscription has received its message`
            };
        } else {
            return {
                valid: false,
                name: this.messageReceivedTestName,
                description: `Avoidable subscription shouldn't have received a message`
            };
        }
    }

    private createMessageNotReceived() {
        if (!this.avoidable) {
            return {
                valid: false,
                name: this.messageReceivedTestName,
                description: `Subscription has not received its message in a valid time`
            };
        } else {
            return {
                valid: true,
                name: this.messageReceivedTestName,
                description: `Avoidable subscription has not received a message`
            };
        }
    }

    private createTimeoutReport(): TestModel {
        const name = `No time out`;
        if (!this.avoidable) {
            return {
                valid: false,
                name: name,
                description: `Subscription has timed out`
            };
        } else {
            return {
                valid: true,
                name: name,
                description: `Avoidable subscription has not received a message`
            };
        }
    }

}
