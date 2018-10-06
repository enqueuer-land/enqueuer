import {Logger} from '../loggers/logger';
import {Protocol} from './protocol';
import '../injectable-files-list';
import prettyjson from 'prettyjson';

//TODO unify these value in a single file
const options = {
    defaultIndentation: 4,
    inlineArrays: true,
    emptyArrayMsg: '(empty)',
    keysColor: 'green',
    dashColor: 'grey'
};

//TODO test it
export class ProtocolManager {
    private static instance: ProtocolManager;

    private publishers: Protocol[] = [];
    private subscriptions: Protocol[] = [];

    private constructor() {
        /* do nothing */
    }

    public static getInstance(): ProtocolManager {
        if (!ProtocolManager.instance) {
            ProtocolManager.instance = new ProtocolManager();
        }
        return ProtocolManager.instance;
    }

    public printAvailable(): void {
        const printable = {
            Protocols: {
                Publishers: this.publishers,
                Subscriptions: this.subscriptions
            }
        };
        console.log(prettyjson.render(printable, options));
    }

    public insertPublisherProtocol(name: string, alternativeNames: string[] = [], libraryName?: string ): Protocol {
        const protocol = new Protocol(name, alternativeNames, libraryName);
        this.publishers.push(protocol);
        return protocol;
    }

    public insertSubscriptionProtocol(name: string, alternativeNames: string[] = [], libraryName?: string ): Protocol {
        const protocol = new Protocol(name, alternativeNames, libraryName);
        this.subscriptions.push(protocol);
        return protocol;
    }

    public suggestSimilarSubscriptions(type?: string): void {
        this.suggestSimilar(this.subscriptions, type as string);
    }

    public suggestSimilarPublishers(type: string): void {
        this.suggestSimilar(this.publishers, type);
    }

    private suggestSimilar(protocols: Protocol[], name: string): void {
        const ratingSortedProtocols = protocols
            .sort((first, second) => second.getBestRating(name).rating
                                                - first.getBestRating(name).rating);
        ratingSortedProtocols
            .filter((value, index) => index <= 2)
            .forEach((protocol) => {
                const bestRating = protocol.getBestRating(name);
                if (bestRating.rating > 50) {
                    Logger.warning(`${bestRating.rating}% sure you meant '${bestRating.target}'`);
                    protocol.suggestInstallation();
                } else if (bestRating.rating > 10) {
                    Logger.warning(`There is a tiny ${bestRating.rating}% possibility you tried to type '${bestRating.target}'`);
                }
            });
    }

}