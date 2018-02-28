import {EventCallback} from "./requisition/event-callback";
import {SubscriptionOnMessageReceivedExecutor} from "../function-executor/subscription-on-message-received-executor";
import {Subscription} from "./requisition/subscription/subscription";

export class SubscriptionReport {

    private subscription: Subscription;
    private subscriptionReport: any = null;
    private onMessageReceivedCallback: EventCallback;
    private id: number;

    constructor(subscription: Subscription, id: number) {
        this.subscription = subscription;
        this.onMessageReceivedCallback = () => {};
        this.id = id;
        this.subscriptionReport = {
            ...subscription,
        };
    }

    public start(onSubscriptionCompleted: EventCallback, onMessageReceivedCallback: EventCallback) {
        this.onMessageReceivedCallback = onMessageReceivedCallback;
        this.subscription.subscribe((subscription: Subscription) => this.onMessageReceived(subscription),
            (subscription: Subscription) => onSubscriptionCompleted(this.id));
    }

    public unsubscribe(): any {
        this.subscription.unsubscribe();
    }

    private onMessageReceived(subscription: Subscription) {
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

        this.subscriptionReport = {
            ...subscription,
            timestamp: new Date(),
            onMessageReceived: onMessageReceived
        };
        this.onMessageReceivedCallback(this.id);
    }

    public getReport() {
        return this.subscriptionReport;
    }

}