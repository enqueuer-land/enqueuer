import {Publisher} from './publisher';
import {Injectable} from 'conditional-injector';
import {PublisherModel} from '../models/inputs/publisher-model';
import {Protocol} from '../protocols/protocol';
const container = require('rhea');

const protocol = new Protocol('amqp1')
    .addAlternativeName('amqp-1')
    .setLibrary('rhea')
    .registerAsPublisher();

@Injectable({predicate: (publish: any) => protocol.matches(publish.type)})
export class Amqp10Publisher extends Publisher {
    private connection: any;

    constructor(publisher: PublisherModel) {
        super(publisher);
    }

    public publish(): Promise<void> {
        return new Promise((resolve) => {
            container.on('connection_open', (context: any) => {
                context.connection.open_sender(this.routingKey);
            });
            container.on('sendable', (context: any) => {
                context.sender.send(this.payload);
                context.sender.detach();
                resolve();
            });
            container.connect(this.options);
        });
    }

}
