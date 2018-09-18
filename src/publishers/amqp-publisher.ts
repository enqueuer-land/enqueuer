import {Publisher} from './publisher';
import {Injectable} from 'conditional-injector';
import {PublisherModel} from '../models/inputs/publisher-model';
import {Logger} from '../loggers/logger';
import * as amqp from 'amqp';

@Injectable({predicate: (publishRequisition: any) => publishRequisition.type === 'amqp'})
export class AmqpPublisher extends Publisher {
    private connection: any;
    private options: any;
    private exchangeName: string;
    private routingKey: string;
    private messageOptions: any;

    constructor(publish: PublisherModel) {
        super(publish);
        this.options = publish.options;
        this.exchangeName = publish.exchange;
        this.routingKey = publish.routingKey;
        this.messageOptions = publish.messageOptions || {};
    }

    public publish(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.connection = amqp.createConnection(this.options);
            this.connection.once('ready', () => {
                const exchange = this.createExchange();
                Logger.debug(`Exchange to publish: '${this.exchangeName || 'default'}' created`);
                exchange.once('open', () => {
                    this.exchangeOpen(exchange, reject, resolve);
                });
            });
            this.connection.on('error', (err: any) => {
                return reject(err);
            });
        });
    }

    private createExchange() {
        return this.connection.exchange(this.exchangeName || '', {confirm: true, passive: true});
    }

    private exchangeOpen(exchange: any, reject: any, resolve: any) {
        Logger.debug(`Exchange '${this.exchangeName || 'default'}' is opened, publishing to routingKey ${this.routingKey}`);
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