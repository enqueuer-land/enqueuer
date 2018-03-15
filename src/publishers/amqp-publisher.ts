import {Publisher} from "./publisher";
import {Logger} from "../loggers/logger";
import {Injectable} from "../injector/injector";
import {PublisherModel} from "../requisitions/models/publisher-model";
var amqp = require('amqp');

@Injectable((publishRequisition: any) => publishRequisition.type === "amqp")
export class AmqpPublisher extends Publisher {
    private connection: any;
    private url: string;
    private queue: string;
    private messageOptions: any;

    constructor(publish: PublisherModel) {
        super(publish);
        this.url = publish.url;
        this.queue = publish.queue;
        this.messageOptions = publish.messageOptions || {};
    }

    public publish(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.connection = amqp.createConnection({url: this.url});
            this.connection.on('ready', () => {
                const exchange = this.connection.exchange();
                exchange.on('open', () => {
                    exchange.publish(this.queue, this.payload, this.messageOptions, (errored: any, err: any) => {
                        reject(err);
                    });
                    //
                    this.connection.end();
                    resolve();
                });
            });
            this.connection.on('error', () => reject(this.connection.disconnect()));

        });
    }

}