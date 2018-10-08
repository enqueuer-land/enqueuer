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
        let result;
        if (typeof(protocol) == 'string') {
            result = this.createDeepDescription(protocol as string);
        } else {
            result = this.createShallowDescription();
        }
        console.log(prettyjson.render(result, options));
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
            .forEach((protocol) => protocol.printTip(name));
    }

    private createShallowDescription(): {} {
        return {
            protocols: {
                publishers: this.publishers.map(protocol => protocol.getName()),
                subscriptions: this.subscriptions.map(protocol => protocol.getName())
            }
        };
    }

    private createDeepDescription(protocolToDescribe: string): {} {
        const result: any = {
            publishers: {},
            subscriptions: {}
        };
        let tolerance = 20;
        this.publishers.map((protocol: Protocol) => {
            if (protocol.matches(protocolToDescribe, tolerance)) {
                result.publishers[protocol.getName()] = protocol.getDescription();
            }
        });
        this.subscriptions.map((protocol: Protocol) => {
            if (protocol.matches(protocolToDescribe, tolerance)) {
                result.subscriptions[protocol.getName()] = protocol.getDescription();
            }
        });
        return result;
    }
}