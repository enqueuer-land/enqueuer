import {Protocol, ProtocolType} from './protocol';
import {SubscriptionModel} from '../models/inputs/subscription-model';
import {Subscription} from '../subscriptions/subscription';
import {ProtocolDocumentation} from './protocol-documentation';

export class SubscriptionProtocol extends Protocol {
    private readonly createFunction: (subscriptionModel: SubscriptionModel) => Subscription;

    public constructor(name: string, createFunction: (subscriptionModel: SubscriptionModel) => Subscription, documentation?: ProtocolDocumentation) {
        super(name, ProtocolType.SUBSCRIPTION, documentation);
        this.createFunction = createFunction;
    }

    public create(subscription: SubscriptionModel): Subscription {
        return this.createFunction(subscription);
    }
}
