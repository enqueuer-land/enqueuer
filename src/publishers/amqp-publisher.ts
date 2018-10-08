import {Publisher} from './publisher';
import {Injectable} from 'conditional-injector';
import {PublisherModel} from '../models/inputs/publisher-model';
import {Logger} from '../loggers/logger';
import * as amqp from 'amqp';
import {Protocol} from '../protocols/protocol';
import {Documentation} from '../protocols/documentation';

const messageOptions = new Documentation()
    .setOptional(true)
    .setReference('https://github.com/postwait/node-amqp#exchangepublishroutingkey-message-options-callbac');
const exchangeOptions = new Documentation()
    .setOptional(true)
    .setReference('https://github.com/postwait/node-amqp#connectionexchangename-options-opencallback');
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
const routingKey = new Documentation()
    .setDescription('Routing key to have a message published in')
    .setExample('enqueuer.integration.test.routing.key');
const exchange = new Documentation()
    .setOptional(true)
    .setDescription('Routing key to have a message published in. If no value is given, it will be published in the \'default exchange\'')
    .setExample('enqueuer.exchange');
const amqpDocumentation = new Documentation()
    .addChild('messageOptions', messageOptions)
    .addChild('exchangeOptions', exchangeOptions)
    .addChild('exchange', exchange)
    .addChild('options', options)
    .addChild('routingKey', routingKey);
const protocol = new Protocol('amqp')
    .setLibrary('amqp')
    .setDocumentation(amqpDocumentation)
    .registerAsPublisher();

@Injectable({predicate: (publish: any) => protocol.matches(publish.type)})
export class AmqpPublisher extends Publisher {
    private connection: any;
    private readonly messageOptions: any;

    constructor(publisher: PublisherModel) {
        super(publisher);
        this.messageOptions = publisher.messageOptions || {};
        this.exchangeOptions = publisher.exchangeOptions || {};
        this.exchangeOptions.confirm = true;
        if (this.exchangeOptions.passive === undefined) {
            this.exchangeOptions.passive = true;
        }
    }

    public publish(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.connection = amqp.createConnection(this.options);
            this.connection.once('ready', () => {
                const exchange = this.getExchange();
                Logger.debug(`Exchange to publish: '${this.exchange || 'default'}' created`);
                exchange.once('open', () => {
                    this.exchangeOpen(exchange, reject, resolve);
                });
            });
            this.connection.on('error', (err: any) => {
                return reject(err);
            });
        });
    }

    private getExchange() {
        return this.connection.exchange(this.exchange || '', this.exchangeOptions);
    }

    private exchangeOpen(exchange: any, reject: any, resolve: any) {
        Logger.debug(`Exchange '${this.exchange || 'default'}' is opened, publishing to routingKey ${this.routingKey}`);
        exchange.publish(this.routingKey, this.payload, this.messageOptions, (errored: any, err: any) => {
            Logger.trace(`Exchange published callback`);
            this.connection.disconnect();
            this.connection.end();
            if (errored) {
                return reject(err);
            }
            Logger.trace(`AMQP message published`);
            resolve();
        });
    }
}