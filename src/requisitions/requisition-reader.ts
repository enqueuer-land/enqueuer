import {Subscription} from "../subscriptions/subscription";
import {SubscriptionFactory} from "../subscriptions/subscription-factory";

export class RequisitionReader {

    private protocol: string;
    private subscription: Subscription;

    constructor(configReader: any) {
        this.protocol = configReader.protocol;
        this.subscription = new SubscriptionFactory().createSubscription(configReader);
    }

    public connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.subscription.connect()
                .then(() => resolve())
                .catch((err) => reject(err));
        });
    }

    public receiveMessage(): Promise<string> {
        return this.subscription.receiveMessage();
    }

    public unsubscribe(): void {
        this.subscription.unsubscribe();
    }

    public getSubscriptionProtocol(): string {
        return this.protocol;
    }

}