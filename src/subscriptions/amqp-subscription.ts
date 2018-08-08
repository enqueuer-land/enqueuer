import {Subscription} from './subscription';
import {Injectable} from 'conditional-injector';
import {SubscriptionModel} from '../models/inputs/subscription-model';
import {Logger} from '../loggers/logger';
import * as amqp from 'amqp';

@Injectable({predicate: (subscriptionAttributes: any) => subscriptionAttributes.type === 'amqp'})
export class AmqpSubscription extends Subscription {

    private connection: any;
    private options: any;
    private exchange: string;
    private routingKey: string;
    private queueName: string;
    private messageReceiverPromiseResolver?: (value?: (PromiseLike<any> | any)) => void;

    constructor(subscriptionAttributes: SubscriptionModel) {
        super(subscriptionAttributes);
        this.options = subscriptionAttributes.options;
        this.exchange = subscriptionAttributes.exchange;
        this.routingKey = subscriptionAttributes.routingKey;
        this.queueName = subscriptionAttributes.queueName;
    }

    public receiveMessage(): Promise<any> {
        return new Promise((resolve) => {
            Logger.debug(`Amqp subscription registering receiveMessage resolver`);
            this.messageReceiverPromiseResolver = resolve;
        });
    }

    public connect(): Promise<void> {
        this.connection = amqp.createConnection(this.options);
        return new Promise((resolve, reject) => {
            this.connection.once('ready', () => {
                this.connection.queue(this.queueName, (queue: any) => {
                    Logger.debug(`Amqp subscription binding ${this.queueName} to exchange ${this.exchange} and routingKey ${this.routingKey}`);
                    queue.bind(this.exchange, this.routingKey, () => {
                        Logger.debug(`Queue ${this.queueName} bound. Subscribing`);
                        queue.subscribe((message: any, headers: any, deliveryInfo: any) => this.gotMessage(message, headers, deliveryInfo));
                        resolve();
                    });
                });
            });
            this.connection.on('error', (err: any) => reject(err));
        });
    }

    public unsubscribe(): void {
        if (this.connection) {
            this.connection.disconnect();
        }
        delete this.connection;
    }

    private gotMessage(message: any, headers: any, deliveryInfo: any) {
        if (this.messageReceiverPromiseResolver) {
            const result = {data: message, headers: headers, deliveryInfo: deliveryInfo};
            this.messageReceiverPromiseResolver(result);
        } else {
            Logger.warning(`Queue ${this.queueName} is not subscribed yet`);
        }
    }

}