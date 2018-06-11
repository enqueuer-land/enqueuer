import {Publisher} from "./publisher";
import {Injectable} from "conditional-injector";
import {PublisherModel} from "../models/inputs/publisher-model";
import {Logger} from "../loggers/logger";

var amqp = require('amqp');

@Injectable({predicate: (publishRequisition: any) => publishRequisition.type === "amqp"})
export class AmqpPublisher extends Publisher {
    private connection: any;
    private options: string;
    private exchange: string;
    private routingKey: string;
    private messageOptions: any;

    constructor(publish: PublisherModel) {
        super(publish);
        this.options = publish.options;
        this.exchange = publish.exchange;
        this.routingKey = publish.routingKey;
        this.messageOptions = publish.messageOptions || {};
    }

    public publish(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.connection = amqp.createConnection(this.options);
            this.connection.on('ready', () => {
                Logger.debug(`Creating exchange ${this.exchange}`);
                const exchange = this.connection.exchange(this.exchange, {confirm: true, passive: true});
                exchange.on('open', () => {
                    Logger.debug(`Exchange ${this.exchange} is opened, publishing to routingKey ${this.routingKey}`);
                    exchange.publish(this.routingKey, this.payload, this.messageOptions, (errored: any, err: any) => {
                        Logger.trace(`Exchange published callback`);
                        if (errored)
                            return reject(err);
                        Logger.debug(`Message published`);
                        this.connection.disconnect();
                        this.connection.end();
                        return resolve();
                    });
                });
            });
            this.connection.on('error', (err: any) => {
                return reject(err);
            });
        });
    }

}