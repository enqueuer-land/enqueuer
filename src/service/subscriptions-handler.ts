import {Subscription} from "./requisition/subscription/subscription";
import {EventCallback} from "./requisition/event-callback";
import {SubscriptionReport} from "./subscription-report";

export class SubscriptionsHandler {
    private subscriptionsReport: SubscriptionReport[] = [];
    private subscriptionsCompletedCounter: number = 0;
    private subscriptionsReceivedMessagesCounter: number = 0;
    private onSubscriptionsCompletedCallback: EventCallback;
    private onAllSubscriptionsReceivedMessagesCallback: EventCallback;


    constructor(subscriptions: Subscription[]) {

        console.log(`SubscriptionHandler handles ${subscriptions} things`);
        console.log("SubscriptionsHandler: " + JSON.stringify(subscriptions, null, 2));


        for (let id: number = 0; id < subscriptions.length; ++id) {
            this.subscriptionsReport.push(new SubscriptionReport(subscriptions[id], id));
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

    private onSubscriptionCompleted(subscriptionId: number) {
        console.log(`Subscription ${subscriptionId} is subscribed`);
        ++this.subscriptionsCompletedCounter;
        if (this.subscriptionsCompletedCounter == this.subscriptionsReport.length)
            this.onSubscriptionsCompletedCallback(null);
    }

    private onMessageReceived(subscriptionId: number) {
        console.log(`Subscription ${subscriptionId} has received messages`);
        ++this.subscriptionsReceivedMessagesCounter;
        if (this.subscriptionsReceivedMessagesCounter == this.subscriptionsReport.length)
            this.onAllSubscriptionsReceivedMessagesCallback(null);
    }

}