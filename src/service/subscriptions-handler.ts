import {EventCallback} from "./requisition/event-callback";
import {SubscriptionReport} from "./subscription-report";
import {SubscriptionFactory} from "./requisition/subscription/subscription-factory";

export class SubscriptionsHandler {
    private subscriptionsReport: SubscriptionReport[] = [];
    private subscriptionsCompletedCounter: number = 0;
    private subscriptionsReceivedMessagesCounter: number = 0;
    private onSubscriptionsCompletedCallback: EventCallback;
    private onAllSubscriptionsReceivedMessagesCallback: EventCallback;


    constructor(subscriptionsAttributes: any) {
        const subscriptionFactory: SubscriptionFactory = new SubscriptionFactory();

        for (let id: number = 0; id < subscriptionsAttributes.length; ++id) {
            const subscription = subscriptionFactory.createSubscription(subscriptionsAttributes[id]);
            if (subscription)
                this.subscriptionsReport.push(new SubscriptionReport(subscription, id));
        }
        this.onSubscriptionsCompletedCallback = () => {};
        this.onAllSubscriptionsReceivedMessagesCallback = () => {};
    }

    public start(onSubscriptionsCompleted: EventCallback, onAllSubscriptionsReceivedMessagesCallback: EventCallback) {
        this.onSubscriptionsCompletedCallback = onSubscriptionsCompleted;
        this.onAllSubscriptionsReceivedMessagesCallback = onAllSubscriptionsReceivedMessagesCallback;
        this.subscriptionsReport.forEach(subscriptionsReport =>
                subscriptionsReport
                    .start((subscription) => this.onSubscriptionCompleted(subscription),
                        (subscription) => this.onMessageReceived(subscription)));
    }

    public unsubscribe(): any {
        this.subscriptionsReport.forEach(subscriptionsReport => subscriptionsReport.unsubscribe());
    }

    public getReports(): any {
        var reports: any = [];
        this.subscriptionsReport.forEach(subscriptionsReport => reports.push(subscriptionsReport.getReport()));
        return reports;
    }

    //TODO: verify id
    private onSubscriptionCompleted(subscriptionId: number) {
        ++this.subscriptionsCompletedCounter;
        if (this.subscriptionsCompletedCounter == this.subscriptionsReport.length)
            this.onSubscriptionsCompletedCallback(null);
    }

    //TODO: verify id
    private onMessageReceived(subscriptionId: number) {
        ++this.subscriptionsReceivedMessagesCounter;
        if (this.subscriptionsReceivedMessagesCounter == this.subscriptionsReport.length)
            this.onAllSubscriptionsReceivedMessagesCallback(null);
    }

}