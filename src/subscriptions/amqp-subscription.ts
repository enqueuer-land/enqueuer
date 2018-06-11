import {Subscription} from "./subscription";
import {Injectable} from "conditional-injector";
import {SubscriptionModel} from "../models/inputs/subscription-model";
import {Logger} from "../loggers/logger";
const amqp = require('amqp');

@Injectable({predicate: (subscriptionAttributes: any) => subscriptionAttributes.type === "amqp"})
export class AmqpSubscription extends Subscription {

    private connection: any;
    private options: string;
    private exchange: string;
    private routingKey: string;
    private queueName: string;

    constructor(subscriptionAttributes: SubscriptionModel) {
        super(subscriptionAttributes);
        this.options = subscriptionAttributes.options;
        this.exchange = subscriptionAttributes.exchange;
        this.routingKey = subscriptionAttributes.routingKey;
        this.queueName = subscriptionAttributes.queueName;
    }

    public receiveMessage(): Promise<string> {
        return new Promise((resolve) => {
            this.connection.queue(this.queueName, (queue:any) => {
                Logger.debug(`Binding ${this.queueName} to exchange ${this.exchange} and routingKey ${this.routingKey}`);
                queue.bind(this.exchange, this.routingKey, () => {
                    Logger.debug(`Queue ${this.queueName} bound. Subscribing.`);
                    queue.subscribe((message: any) => {
                        Logger.debug(`Queue ${this.queueName} subscribed.`);
                        resolve(message.data.toString());
                    });
                });
            });
        });
    }

    public connect(): Promise<void> {
        this.connection = amqp.createConnection(this.options);
        return new Promise((resolve, reject) => {
            this.connection.on('ready', () => resolve());
            this.connection.on('error', (err: any) => reject(err));

        });
    }

    public unsubscribe(): void {
        if (this.connection) {
            this.connection.disconnect();
        }
        delete this.connection;
    }

}