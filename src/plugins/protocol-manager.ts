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
import {getPrettyJsonConfig} from '../outputs/prettyjson-config';
import {Logger} from '../loggers/logger';

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
        Logger.error(`No publisher was found with '${publisherModel.type}'`);
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
        Logger.error(`No subscription was found with '${subscriptionModel.type}'`);
        return new NullSubscription(subscriptionModel);
    }

    public addProtocol(protocol: Protocol): void {
        this.protocols.push(protocol);
    }

    public getMatchingProtocols(describeProtocols: string | true): any {
        return this.createDescription(describeProtocols);
    }

    public describeMatchingProtocols(description: any): boolean {
        const matchingProtocols = this.getMatchingProtocols(description);
        console.log(prettyjson.render(matchingProtocols, getPrettyJsonConfig()));
        return matchingProtocols.publishers.length + matchingProtocols.subscriptions.length > 0;
    }

    private createDescription(protocol: string | true): {} {
        return {
            publishers: this.protocols
                .filter((protocol: Protocol) => protocol.type === ProtocolType.PUBLISHER)
                .filter((publisher: Protocol) => typeof protocol === 'string' ? publisher.matches(protocol) : true)
                .map(protocol => protocol.getDescription()),
            subscriptions: this.protocols
                .filter((protocol: Protocol) => protocol.type === ProtocolType.SUBSCRIPTION)
                .filter((subscription: Protocol) => typeof protocol === 'string' ? subscription.matches(protocol) : true)
                .map(protocol => protocol.getDescription())
        };
    }
}
