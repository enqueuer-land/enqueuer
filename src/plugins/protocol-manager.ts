import prettyjson from 'prettyjson';
import {PublisherModel} from '../models/inputs/publisher-model';
import {Publisher} from '../publishers/publisher';
import {SubscriptionModel} from '../models/inputs/subscription-model';
import {Subscription} from '../subscriptions/subscription';
import {NullSubscription} from '../subscriptions/null-subscription';
import {NullPublisher} from '../publishers/null-publisher';
import {ProtocolType, Protocol} from '../protocols/protocol';
import {PublisherProtocol} from '../protocols/publisher-protocol';
import {SubscriptionProtocol} from '../protocols/subscription-protocol';

const options = {
    defaultIndentation: 4,
    inlineArrays: true,
    emptyArrayMsg: '-',
    keysColor: 'green',
    dashColor: 'grey'
};

export class ProtocolManager {
    private protocols: Protocol[] = [];

    public createPublisher(publisherModel: PublisherModel): Publisher {
        const matchingPublishers = this.protocols
            .filter((protocol: Protocol) => protocol.type === ProtocolType.PUBLISHER)
            .filter((protocol: Protocol) => protocol.matches(publisherModel.type))
            .map((protocol: Protocol) => (protocol as PublisherProtocol).create(publisherModel));
        if (matchingPublishers.length > 0) {
            return matchingPublishers[0];
        }
        return new NullPublisher(publisherModel);
    }

    public createSubscription(subscriptionModel: SubscriptionModel): Subscription {
        const matchingSubscriptions = this.protocols
            .filter((protocol: Protocol) => protocol.type === ProtocolType.SUBSCRIPTION)
            .filter((protocol: Protocol) => protocol.matches(subscriptionModel.type))
            .map((protocol: Protocol) => (protocol as SubscriptionProtocol).create(subscriptionModel));
        if (matchingSubscriptions.length > 0) {
            return matchingSubscriptions[0];
        }
        return new NullSubscription(subscriptionModel);
    }

    public addProtocol(protocol: Protocol): void {
        this.protocols.push(protocol);
    }

    public describeProtocols(): void {
        console.log(prettyjson.render(this.createDescription(), options));
    }

    private createDescription(): {} {
        return {
            publishers: this.protocols
                .filter((protocol: Protocol) => protocol.type === ProtocolType.PUBLISHER)
                .map(protocol => protocol.getDescription()),
            subscriptions: this.protocols
                .filter((protocol: Protocol) => protocol.type === ProtocolType.SUBSCRIPTION)
                .map(protocol => protocol.getDescription())
        };
    }
}
