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
    private messageReceiverPromiseResolver?: Function;

    constructor(subscriptionAttributes: SubscriptionModel) {
        super(subscriptionAttributes);
        this.options = subscriptionAttributes.options;
        this.exchange = subscriptionAttributes.exchange;
        this.routingKey = subscriptionAttributes.routingKey;
        this.queueName = subscriptionAttributes.queueName;
    }

    public receiveMessage(): Promise<string> {
        return new Promise((resolve) => {
            this.messageReceiverPromiseResolver = resolve;
        });
    }

    public connect(): Promise<void> {
        this.connection = amqp.createConnection(this.options);
        return new Promise((resolve, reject) => {
            this.connection.on('ready', () => {
                this.connection.queue(this.queueName, (queue: any) => {
                    Logger.debug(`Binding ${this.queueName} to exchange ${this.exchange} and routingKey ${this.routingKey}`);
                    queue.bind(this.exchange, this.routingKey, () => {
                        Logger.debug(`Queue ${this.queueName} bound. Subscribing.`);
                        queue.subscribe((message: any, headers: any) => this.gotMessage(message, headers));
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

    private gotMessage(message: any, headers: any) {
        Logger.debug(`Queue ${this.queueName} got Message.`);
        if (this.messageReceiverPromiseResolver) {
            message.headers = headers;
            this.messageReceiverPromiseResolver(message);
        }
    }

}