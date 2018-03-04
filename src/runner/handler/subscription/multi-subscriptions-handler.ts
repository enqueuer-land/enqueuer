import {SubscriptionHandler} from "./subscription-handler";
import {SubscriptionFactory} from "../../../requisition/subscription/subscription-factory";

export class MultiSubscriptionsHandler {
    private subscriptionHandlers: SubscriptionHandler[] = [];
    private subscriptionsCompletedCounter: number = 0;
    private subscriptionsReceivedMessagesCounter: number = 0;
    private onSubscriptionsCompletedCallback: Function;
    private onAllSubscriptionsStopWaitingCallback: Function;


    constructor(subscriptionsAttributes: any[]) {
        const subscriptionFactory: SubscriptionFactory = new SubscriptionFactory();

        for (let id: number = 0; id < subscriptionsAttributes.length; ++id) {
            const subscription = subscriptionFactory.createSubscription(subscriptionsAttributes[id]);
            this.subscriptionHandlers.push(new SubscriptionHandler(subscription));
        }
        this.onSubscriptionsCompletedCallback = () => {};
        this.onAllSubscriptionsStopWaitingCallback = () => {};
    }

    public start(onSubscriptionsCompleted: Function, onAllSubscriptionsStopWaitingCallback: Function) {
        this.onSubscriptionsCompletedCallback = onSubscriptionsCompleted;
        this.onAllSubscriptionsStopWaitingCallback = onAllSubscriptionsStopWaitingCallback;
        this.subscriptionHandlers.forEach(subscriptionHandler =>
                subscriptionHandler
                    .start((subscriptionHandler: MultiSubscriptionsHandler) =>
                            this.onSubscriptionCompleted(),
                        (subscriptionHandler: MultiSubscriptionsHandler) =>
                            this.onAllSubscriptionsStopWaiting()));
    }

    public getReport(): any {
        var reports: any = [];
        this.subscriptionHandlers.forEach(subscriptionsReport => reports.push(subscriptionsReport.getReport()));
        return reports;
    }

    private onSubscriptionCompleted() {
        ++this.subscriptionsCompletedCounter;
        if (this.subscriptionsCompletedCounter == this.subscriptionHandlers.length)
            this.onSubscriptionsCompletedCallback();
    }

    private onAllSubscriptionsStopWaiting() {
        ++this.subscriptionsReceivedMessagesCounter;
        if (this.subscriptionsReceivedMessagesCounter >= this.subscriptionHandlers.length)
            this.onAllSubscriptionsStopWaitingCallback();
    }

}