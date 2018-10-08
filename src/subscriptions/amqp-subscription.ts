import {Subscription} from './subscription';
import {Injectable} from 'conditional-injector';
import {SubscriptionModel} from '../models/inputs/subscription-model';
import {Logger} from '../loggers/logger';
import * as amqp from 'amqp';
import {StringRandomCreator} from '../strings/string-random-creator';
import {Protocol} from '../protocols/protocol';
import {Documentation} from '../protocols/documentation';

const host = new Documentation()
    .setOptional(true)
    .setDescription('Host address')
    .setDefaultValue('localhost');
const port = new Documentation()
    .setOptional(true)
    .setDescription('Host port')
    .setDefaultValue(5672);
const options = new Documentation()
    .setOptional(true)
    .setDescription('Connection options')
    .addChild('host', host)
    .addChild('port', port)
    .setReference('https://github.com/postwait/node-amqp#connection-options-and-url');
const queueName = new Documentation()
    .setOptional(true)
    .setDescription('Queue to be created while enqueuer is running. It lasts as long as enqueuer.')
    .setDefaultValue('Randomly created name')
    .setExample('enqueuer.queue.name');
const routingKey = new Documentation()
    .setOptional(true)
    .setDescription('Routing key to have a message published in. If a value is set, a \'exchange\' has to be set as well.')
    .setExample('enqueuer.integration.#');
const exchange = new Documentation()
    .setOptional(true)
    .setDescription('Exchange name to have a message published in. If a value is set, a \'routingKey\' has to be set as well.')
    .setExample('enqueuer.exchange');
const amqpDocumentation = new Documentation()
    .addChild('options', options)
    .addChild('queueName', queueName)
    .addChild('exchange', exchange)
    .addChild('routingKey', routingKey);
const protocol = new Protocol('amqp')
    .setLibrary('amqp')
    .setDocumentation(amqpDocumentation)
    .registerAsSubscription();

@Injectable({predicate: (publish: any) => protocol.matches(publish.type)})
export class AmqpSubscription extends Subscription {

    private readonly queueName: string;
    private connection: any;
    private messageReceiverPromiseResolver?: (value?: (PromiseLike<any> | any)) => void;

    constructor(subscriptionAttributes: SubscriptionModel) {
        super(subscriptionAttributes);
        this.queueName = subscriptionAttributes.queueName || new StringRandomCreator().create(8);
    }

    public receiveMessage(): Promise<any> {
        return new Promise((resolve) => {
            Logger.debug(`Amqp subscription registering receiveMessage resolver`);
            this.messageReceiverPromiseResolver = resolve;
        });
    }

    public subscribe(): Promise<void> {
        this.connection = amqp.createConnection(this.options);
        return new Promise((resolve, reject) => {
            this.connection.once('ready', () => {
                this.connectionReady(resolve, reject);
            });
            this.connection.on('error', (err: any) => reject(err));
        });
    }

    public async unsubscribe(): Promise<void> {
        if (this.connection) {
            this.connection.disconnect();
        }
        delete this.connection;
    }

    private connectionReady(resolve: any, reject: any) {
        this.connection.queue(this.queueName, (queue: any) => {
            queue.subscribe((message: any, headers: any, deliveryInfo: any) => this.gotMessage(message, headers, deliveryInfo));
            if (this.exchange && this.routingKey) {
                this.bind(queue, resolve);
            } else if (this.queueName) {
                Logger.debug(`Queue ${this.queueName} bound to the default exchange`);
                resolve();
            } else {
                reject(`Impossible to subscribe: ${this.queueName}:${this.exchange}:${this.routingKey}`);
            }
        });
    }

    private bind(queue: any, resolve: any) {
        Logger.debug(`Amqp subscription binding ${this.queueName} to exchange: ${this.exchange} and routingKey: ${this.routingKey}`);
        queue.bind(this.exchange, this.routingKey, () => {
            Logger.debug(`Queue ${this.queueName} bound`);
            resolve();
        });
    }

    private gotMessage(message: any, headers: any, deliveryInfo: any) {
        if (this.messageReceiverPromiseResolver) {
            const result = {payload: message, headers: headers, deliveryInfo: deliveryInfo};
            this.messageReceiverPromiseResolver(result);
        } else {
            Logger.warning(`Queue ${this.queueName} is not subscribed yet`);
        }
    }

}