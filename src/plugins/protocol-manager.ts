import prettyjson from 'prettyjson';
import {PublisherModel} from '../models/inputs/publisher-model';
import {Publisher} from '../publishers/publisher';
import {SubscriptionModel} from '../models/inputs/subscription-model';
import {Subscription} from '../subscriptions/subscription';
import {NullSubscription} from '../subscriptions/null-subscription';
import {NullPublisher} from '../publishers/null-publisher';
import {Protocol} from '../protocols/protocol';
import {PublisherProtocol} from '../protocols/publisher-protocol';
import {SubscriptionProtocol} from '../protocols/subscription-protocol';
import {getPrettyJsonConfig} from '../outputs/prettyjson-config';
import {Logger} from '../loggers/logger';

export class ProtocolManager {
    private protocols: Protocol[] = [];

    public createPublisher(publisherModel: PublisherModel): Publisher {
        const matchingPublishers = this.protocols
            .filter((protocol: Protocol) => protocol.isPublisher())
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
            .filter((protocol: Protocol) => protocol.isSubscription())
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

    public getMatchingProtocols(describeProtocols?: string): any {
        return this.getDescription(describeProtocols);
    }

    public describeMatchingProtocols(description?: string): boolean {
        const matchingProtocols = this.getMatchingProtocols(description);
        console.log(prettyjson.render(matchingProtocols, getPrettyJsonConfig()));
        return matchingProtocols.publishers.length + matchingProtocols.subscriptions.length > 0;
    }

    private getDescription(protocol?: string): {} {
        return {
            publishers: this.protocols
                .filter((protocol: Protocol) => protocol.isPublisher())
                .filter((publisher: Protocol) => protocol ? publisher.matches(protocol) : true)
                .map(protocol => protocol.getDescription()),
            subscriptions: this.protocols
                .filter((protocol: Protocol) => protocol.isSubscription())
                .filter((subscription: Protocol) => protocol ? subscription.matches(protocol) : true)
                .map(protocol => protocol.getDescription())
        };
    }
}
