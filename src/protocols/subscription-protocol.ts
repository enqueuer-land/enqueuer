import {Protocol, ProtocolType} from './protocol';
import {SubscriptionModel} from '../models/inputs/subscription-model';
import {Subscription} from '../subscriptions/subscription';

export class SubscriptionProtocol extends Protocol {
    private readonly messageReceivedParams: string[];
    private readonly createFunction: (subscriptionModel: SubscriptionModel) => Subscription;

    public constructor(name: string,
                       createFunction: (subscriptionModel: SubscriptionModel) => Subscription,
                       messageReceivedParams: string[]) {
        super(name, ProtocolType.SUBSCRIPTION);
        this.messageReceivedParams = messageReceivedParams;
        this.createFunction = createFunction;
    }

    public create(subscription: SubscriptionModel): Subscription {
        return this.createFunction(subscription);
    }

    protected getDeepDescription(): any {
        if (this.messageReceivedParams && this.messageReceivedParams.length > 0) {
            return {
                messageReceivedParams: this.messageReceivedParams
            };
        }
        return {};
    }
}
