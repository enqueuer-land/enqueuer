import {Logger} from '../loggers/logger';
import {Protocol} from './protocol';
import '../injectable-files-list';
import prettyjson from 'prettyjson';

const options = {
    defaultIndentation: 4,
    inlineArrays: true,
    emptyArrayMsg: '-',
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

    public describeProtocols(protocol: true | string): void {
        if (typeof(protocol) == 'string') {
            this.printDeepDescription(protocol as string);
        } else {
            this.printShallowDescription();
        }
    }

    public insertPublisher(protocol: Protocol): void {
        this.publishers.push(protocol);
    }

    public insertSubscription(protocol: Protocol): void {
        this.subscriptions.push(protocol);
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

        Logger.warning(`Unknown protocol '${name}'`);
        ratingSortedProtocols
            .filter((value, index) => index <= 2)
            .forEach((protocol) => {
                const bestRating = protocol.getBestRating(name);
                if (bestRating.rating > 50) {
                    Logger.warning(`${bestRating.rating}% sure you meant '${bestRating.target}'`);
                    protocol.suggestInstallation();
                } else if (bestRating.rating > 10) {
                    Logger.warning(`There is a tiny possibility (${bestRating.rating}%) you tried to type '${bestRating.target}'`);
                }
            });
    }

    private printShallowDescription(): void {
        const printable = {
            protocols: {
                publishers: this.publishers.map(protocol => protocol.getName()),
                subscriptions: this.subscriptions.map(protocol => protocol.getName())
            }
        };
        console.log(prettyjson.render(printable, options));
    }

    private printDeepDescription(protocolToDescribe: string): void {
        const result: any = {};
        let tolerance = 10;
        const checkDescriptionInsertion = (protocol: Protocol) => {
            if (protocol.matches(protocolToDescribe, tolerance)) {
                result[protocol.getName()] =  protocol.getProperties();
            }
        };
        this.publishers.map(checkDescriptionInsertion);
        this.subscriptions.map(checkDescriptionInsertion);
        if ((Object.keys(result)).length == 0) {
            console.log('Not supported protocol');
        } else {
            console.log(prettyjson.render(result, options));
        }
    }
}