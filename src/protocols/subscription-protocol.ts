import {HookEventsDescription, Protocol, ProtocolType} from './protocol';
import {SubscriptionModel} from '../models/inputs/subscription-model';
import {Subscription} from '../subscriptions/subscription';

export class SubscriptionProtocol extends Protocol {
    private readonly createFunction: (subscriptionModel: SubscriptionModel) => Subscription;

    public constructor(name: string,
                       createFunction: (subscriptionModel: SubscriptionModel) => Subscription,
                       hookEventsDescription: string[] | HookEventsDescription = {}) {
        super(name, ProtocolType.SUBSCRIPTION, hookEventsDescription);
        this.createFunction = createFunction;
    }

    public create(subscription: SubscriptionModel): Subscription {
        return this.createFunction(subscription);
    }

}
