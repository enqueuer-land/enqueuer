import {Subscription} from "./requisition/subscription/subscription";
import {SubscriptionSuperClass} from "./requisition/subscription/subscription-super-class";
import {EventCallback} from "./requisition/event-callback";
import {SubscriptionOnMessageReceivedExecutor} from "../function-executor/subscription-on-message-received-executor";

export class SubscriptionHandler {
    private subscriptions: Subscription[] = [];

    constructor(subscriptions: Subscription[]) {
        this.subscriptions = subscriptions;
    }

    public start(onSubscriptionsCompleted: EventCallback) {
        this.subscribeSubscriptions();
    }

    private onMessageReceived(subscription: SubscriptionSuperClass) {
        this.generateSubscriptionReceivedMessageReport(subscription);

        // if (this.requisition.subscriptions.length === 0) {
        //     this.onFinish();
        // }

    }

    private onSubscriptionCompleted(subscription: SubscriptionSuperClass) {
        console.log("I have to count how many subscriptions are completed");
    }

    private subscribeSubscriptions(): void {
        this.subscriptions
            .forEach(subscription =>
                subscription.subscribe((subscription: SubscriptionSuperClass) => this.onMessageReceived(subscription),
                    (subscription: SubscriptionSuperClass) => this.onSubscriptionCompleted(subscription)));
    }

    private generateSubscriptionReceivedMessageReport(subscription: SubscriptionSuperClass) {

        let onMessageReceived = {};
        try {
            let subscriptionTestExecutor: SubscriptionOnMessageReceivedExecutor
                = new SubscriptionOnMessageReceivedExecutor(subscription);

            subscriptionTestExecutor.execute();

            onMessageReceived = {
                tests: {
                    failing: subscriptionTestExecutor.getFailingTests(),
                    passing: subscriptionTestExecutor.getPassingTests(),
                    onMessageReceivedExecutionException: subscriptionTestExecutor.getWarning()
                },
                reports: subscriptionTestExecutor.getReports()
            }
        } catch (exc) {
            onMessageReceived = {
                onMessageReceivedFunctionCreationException: exc
            }
        }

        var subscriptionReport = {
            ...subscription,
            timestamp: new Date(),
            onMessageReceived: onMessageReceived
        };
        this.reportGenerator.addSubscriptionReport(subscriptionReport);
    }


}