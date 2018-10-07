import {Subscription} from './subscription';
import {SubscriptionModel} from '../models/inputs/subscription-model';
import {Injectable} from 'conditional-injector';
import {Logger} from '../loggers/logger';
import {Json} from '../object-notations/json';
import {Protocol} from '../protocols/protocol';

const Stomp = require('stomp-client');

const protocol = new Protocol('stomp')
    .setLibrary('stomp-client')
    .registerAsSubscription();

@Injectable({predicate: (publish: any) => protocol.matches(publish.type)})
export class StompSubscription extends Subscription {
    private client: any;

    constructor(subscriptionModel: SubscriptionModel) {
        super(subscriptionModel);
    }

    public receiveMessage(): Promise<any> {
        return new Promise((resolve, reject) => {
            Logger.trace(`Stomp waiting for a message related to queue ${this.queue}`);
            this.client.subscribe(this.queue, (message: string, headers: {}) => {
                Logger.trace(`Stomp message received header ${new Json().stringify(headers)}`);
                resolve({payload: message, headers: headers});
            });
            this.client.once('error', (err: any) => {
                reject(err);
            });
        });
    }

    public subscribe(): Promise<void> {
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

    public async unsubscribe(): Promise<void> {
        this.client.unsubscribe(this.queue);
    }

}