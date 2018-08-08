import {Subscription} from './subscription';
import {SubscriptionModel} from '../models/inputs/subscription-model';
import {Injectable} from 'conditional-injector';
import {Logger} from '../loggers/logger';
const Stomp = require('stomp-client');

@Injectable({predicate: (subscriptionAttributes: any) => subscriptionAttributes.type === 'stomp'})
export class StompSubscription extends Subscription {
    private queue: string;
    private password: string;
    private user: string;
    private port: string;
    private address: string;
    private client: any;

    constructor(subscriptionModel: SubscriptionModel) {
        super(subscriptionModel);
        this.address = subscriptionModel.address;
        this.port = subscriptionModel.port;
        this.user = subscriptionModel.user;
        this.password = subscriptionModel.password;
        this.queue = subscriptionModel.queue;
    }

    public receiveMessage(): Promise<string> {
        return new Promise((resolve, reject) => {
            Logger.trace(`Stomp waiting for a message related to queue ${this.queue}`);
            this.client.subscribe(this.queue, (message: string, headers: {}) => {
                Logger.trace(`Stomp message received header ${JSON.stringify(headers, null, 2)}`);
                resolve(message);
            });
            this.client.once('error', (err: any) => {
                reject(err);
            });
        });
    }

    public connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            Logger.debug(`Stomp subscription connecting to ${this.address}:${this.port}`);
            this.client = new Stomp(this.address, this.port, this.user, this.password);
            this.client.connect((sessionId: string) => {
                    Logger.debug(`Stomp subscription connected id ${sessionId}`);
                    resolve();
                }, (err: any) => {
                    reject(err);
                });
        });

    }

    public unsubscribe(): void {
        this.client.unsubscribe(this.queue);
    }

}