import {Subscription} from "../../../requisition/subscription/subscription";
import {FunctionExecutor} from "../../../function-executor/function-executor";

export class SubscriptionHandler {

    private subscription: Subscription;
    private report: any = {};
    private onStopWaitingCallback: Function;
    private onSubscriptionCompletedCallback: Function;
    private startTime: Date;

    constructor(subscription: Subscription) {
        this.subscription = subscription;
        this.onSubscriptionCompletedCallback = () => {};
        this.onStopWaitingCallback = () => {};
        this.startTime = new Date();
    }

    public start(onSubscriptionCompletedCallback: Function, onStopWaitingCallback: Function) {
        this.report = {
            ...this.report,
            startTime: this.startTime.toString(),
        };
        this.initializeTimeout();
        this.onSubscriptionCompletedCallback = onSubscriptionCompletedCallback;
        this.onStopWaitingCallback = onStopWaitingCallback;
        this.subscription.subscribe((subscription: Subscription) => this.onMessageReceived(),
            (subscription: Subscription) => this.onSubscriptionCompleted());
    }

    public getReport() {
        this.report = {
            ...this.report,
            subscription: this.subscription,
            timestamp: new Date().toString(),
            hasReceivedMessage: this.subscription.messageReceived != null
        };
        if (this.subscription.timeout && this.subscription.messageReceived)
            this.report.hasTimedOut = (new Date().getTime() - this.startTime.getTime()) > this.subscription.timeout;
        this.subscription.unsubscribe();
        return this.report;
    }

    private initializeTimeout() {
        if (this.subscription.timeout) {
            let timer = global.setTimeout(() => {
                global.clearTimeout(timer);
                console.log("Subscription Timeout");
                this.stopWaiting();
            }, this.subscription.timeout);
        }
    }

    private onMessageReceived() {
        this.executeSubscriptionFunction();
        this.subscription.unsubscribe();
        this.stopWaiting();
    }

    private stopWaiting() {
        console.log("Subscription stop waitting")
        this.onStopWaitingCallback();
        this.onStopWaitingCallback = () => {};
    }

    private onSubscriptionCompleted(): any {
        this.report = {
            ...this.report,
            subscriptionTime: new Date().toString()
        };
        this.onSubscriptionCompletedCallback();
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

        }

    }

}