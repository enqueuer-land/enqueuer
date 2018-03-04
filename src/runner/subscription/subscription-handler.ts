import {Subscription} from "../../requisition/subscription/subscription";
import {FunctionExecutor} from "../../function-executor/function-executor";

export class SubscriptionHandler {

    private timer: any;
    private subscription: Subscription;
    private report: any = {};
    private startTime: Date;
    private onTimeOutCallback: Function = () => {};
    private hasTimedOut: boolean = false;

    constructor(subscription: Subscription) {
        this.subscription = subscription;
        this.startTime = new Date();
    }

    public onTimeout(onTimeOutCallback: Function) {
        this.onTimeOutCallback = onTimeOutCallback;
    }

    public connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.subscription.connect()
                .then(() => {
                    this.report = {
                        ...this.report,
                        connectionTime: new Date().toString()
                    };
                    this.initializeTimeout();
                    resolve();
                })
                .catch((err) => reject(err));
        });
    }

    public receiveMessage(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.subscription.receiveMessage()
                .then(() => {
                    this.executeSubscriptionFunction();
                    if (!this.hasTimedOut) {
                        console.log("Subscription stop waiting because has already received its message");
                        global.clearTimeout(this.timer);
                        resolve();
                    }
                })
                .catch((err) => reject(err));
        });
    }

    public getReport() {
        this.report = {
            ...this.report,
            subscription: this.subscription,
            hasReceivedMessage: this.subscription.messageReceived != null,
            hasTimedOut: this.hasTimedOut
        };
        this.subscription.unsubscribe();
        return this.report;
    }

    private initializeTimeout() {
        if (this.subscription.timeout) {
            this.timer = global.setTimeout(() => {
                console.log("Subscription stop waiting because has timed out");
                this.subscription.unsubscribe();
                this.hasTimedOut = true;
                this.onTimeOutCallback();
            }, this.subscription.timeout);
        }
    }

    private executeSubscriptionFunction() {
        const functionToExecute: Function | null = this.subscription.createOnMessageReceivedFunction();
        if (functionToExecute) {
            let functionReport = null;
            try {
                let subscriptionTestExecutor: FunctionExecutor
                    = new FunctionExecutor(functionToExecute, this.subscription.messageReceived);
                subscriptionTestExecutor.execute();

                functionReport = {
                    tests: {
                        failing: subscriptionTestExecutor.getFailingTests(),
                        passing: subscriptionTestExecutor.getPassingTests(),
                    },
                    exception: subscriptionTestExecutor.getException(),
                    reports: subscriptionTestExecutor.getReports(),
                }
            } catch (exc) {
                functionReport = {
                    exception: exc
                }
            }
            this.report = {
                ...this.report,
                functionReport: functionReport
            }

            this.report.messageReceivedTimestamp = new Date().toString();
        }

    }

}