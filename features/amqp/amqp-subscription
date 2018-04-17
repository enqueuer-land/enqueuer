import {Subscription} from "./subscription";
import {Injectable} from "../injector/injector";
import {SubscriptionModel} from "../requisitions/models/subscription-model";
const amqp = require('amqp');

@Injectable((subscriptionAttributes: any) => subscriptionAttributes.type === "amqp")
export class AmqpSubscription extends Subscription {

    private connection: any;
    private options: string;
    private queueName: string;

    constructor(subscriptionAttributes: SubscriptionModel) {
        super(subscriptionAttributes);
        this.options = subscriptionAttributes.options;
        this.queueName = subscriptionAttributes.queueName;
    }

    public receiveMessage(): Promise<string> {
        return new Promise((resolve, reject) => {
            this.connection.queue(this.queueName, (queue:any) => {
                queue.subscribe((message: any) => {
                    resolve(message.data.toString());
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