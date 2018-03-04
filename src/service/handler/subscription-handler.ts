import {Subscription} from "../../requisition/subscription/subscription";
import {FunctionExecutor} from "../../function-executor/function-executor";

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

        this.onSubscriptionCompletedCallback = onSubscriptionCompletedCallback;
        this.onStopWaitingCallback = onStopWaitingCallback;
        this.subscription.subscribe((subscription: Subscription) => this.onMessageReceived(),
            (subscription: Subscription) => this.onSubscriptionCompleted());
    }

    private onSubscriptionCompleted(): any {
        this.report = {
            ...this.report,
            subscriptionTime: new Date().toString()
        };
        this.onSubscriptionCompletedCallback();
    }

    public getReport() {
        this.report = {
            ...this.report,
            subscription: this.subscription,
            timestamp: new Date().toString(),
            hasReceivedMessage: this.subscription.messageReceived != null
        };
        this.subscription.unsubscribe();
        return this.report;
    }

    private onMessageReceived() {
        this.executeSubscriptionFunction();
        this.subscription.unsubscribe();
        this.onStopWaitingCallback();
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
                    hasTimedOut: (new Date().getTime() - this.startTime.getTime()) > this.subscription.timeout
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