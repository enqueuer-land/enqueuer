import {Logger} from '../loggers/logger';
import {Protocol} from './protocol';
import '../injectable-files-list';

//TODO test it
export class ProtocolsManager {
    private static publishers: Protocol[] = [];
    private static subscriptions: Protocol[] = [];
    public listAvailable(): string[] {
        return [...new Set([...ProtocolsManager.subscriptions.map(protocol => protocol.getName()),
                                    ...ProtocolsManager.publishers.map(protocol => protocol.getName())])]
                .sort();
    }

    public static insertPublisherProtocol(name: string, alternativeNames: string[] = [], libraryName?: string ): Protocol {
        const protocol = new Protocol(name, alternativeNames, libraryName);
        ProtocolsManager.publishers.push(protocol);
        return protocol;
    }

    public static insertSubscriptionProtocol(name: string, alternativeNames: string[] = [], libraryName?: string ): Protocol {
        const protocol = new Protocol(name, alternativeNames, libraryName);
        ProtocolsManager.subscriptions.push(protocol);
        return protocol;
    }

    public static suggestSubscriptionBasedOn(type?: string): void {
        ProtocolsManager.suggestBasedOnGroup(ProtocolsManager.subscriptions, type as string);
    }

    public static suggestPublisherBasedOn(type: string): void {
        ProtocolsManager.suggestBasedOnGroup(ProtocolsManager.publishers, type);
    }

    private static suggestBasedOnGroup(protocols: Protocol[], name: string): void {
        const ratingSortedProtocols = protocols
            .sort((first, second) => first.getBestRating(name).rating
                                                - second.getBestRating(name).rating);

        ratingSortedProtocols
            .filter((value, index) => index <= 2)
            .forEach((protocol) => {
                const bestRating = protocol.getBestRating(name);
                if (bestRating.rating > 50) {
                    Logger.warning(`${bestRating.rating}% sure you meant '${bestRating.target}'`);
                    protocol.suggestInstallation();
                }
            });
    }

}