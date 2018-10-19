import {Publisher} from './publisher';
import {Injectable} from 'conditional-injector';
import {PublisherModel} from '../models/inputs/publisher-model';
import {Logger} from '../loggers/logger';
const container = require('rhea');
import {Protocol} from '../protocols/protocol';

const protocol = new Protocol('amqp10')
    .setLibrary('rhea')
    .registerAsPublisher();

@Injectable({predicate: (publish: any) => protocol.matches(publish.type)})
export class Amqp10Publisher extends Publisher {
    private connection: any;
    private readonly messageOptions: any;

    constructor(publisher: PublisherModel) {
        super(publisher);
    }

    public publish(): Promise<void> {
        return new Promise((resolve, reject) => {
            container.on('connection_open', (context: any) => {
                // context.connection.open_receiver('examples');
                context.connection.open_sender(this.routingKey);
            });
            container.on('sendable', (context: any) => {
                context.sender.send({body: this.payload});
                context.sender.detach();
                resolve();
            });
            container.connect(this.options);

            // this.connection = amqp.createConnection(this.options);
            // this.connection.once('ready', () => {
            //     const exchange = this.getExchange();
            //     Logger.debug(`Exchange to publish: '${this.exchange || 'default'}' created`);
            //     exchange.once('open', () => {
            //         this.exchangeOpen(exchange, reject, resolve);
            //     });
            // });
            // this.connection.on('error', (err: any) => {
            //     return reject(err);
            // });
        });
    }

}
