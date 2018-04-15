import {Publisher} from "../../src/publishers/publisher";
import {Injectable} from "../../src/injector/injector";
import {PublisherModel} from "../../src/requisitions/models/publisher-model";

var amqp = require('amqp');

@Injectable((publishRequisition: any) => publishRequisition.type === "amqp")
export class AmqpPublisher extends Publisher {
    private connection: any;
    private options: string;
    private queueName: string;
    private messageOptions: any;

    constructor(publish: PublisherModel) {
        super(publish);
        this.options = publish.options;
        this.queueName = publish.queueName;
        this.messageOptions = publish.messageOptions || {};
    }

    public publish(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.connection = amqp.createConnection(this.options);
            this.connection.on('ready', () => {
                const exchange = this.connection.exchange();
                exchange.on('open', () => {
                    exchange.publish(this.queueName, this.payload, this.messageOptions, (errored: any, err: any) => {
                        return reject(err);
                    });
                    this.connection.disconnect();
                    this.connection.end();
                    return resolve();
                });
            });
            this.connection.on('error', (err: any) => {
                return reject(err);
            });
        });
    }

}