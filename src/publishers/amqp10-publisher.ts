import {Publisher} from './publisher';
import {Injectable} from 'conditional-injector';
import {PublisherModel} from '../models/inputs/publisher-model';
import {Protocol} from '../protocols/protocol';
import {ObjectDecycler} from '../object-notations/object-decycler';

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
        return new Promise((resolve, reject) => {
            container.once('connection_error', (err: any) => reject(err.error));
            container.once('error', (err: any) => reject(err.error));
            container.once('sender_error', (err: any) => reject(err.error));
            container.once('disconnected', (err: any) => reject(err.error));
            container.once('rejected', (err: any) => reject(err.error));
            container.once('connection_open', (context: any) => {
                context.connection.open_sender(this.options);
            });
            container.once('sendable', (context: any) => {
                const delivery = context.sender.send(this.payload);
                this.messageReceived = new ObjectDecycler().decycle(delivery);
                context.sender.detach();
                resolve();
            });
            container.connect(this.connection);
        });
    }

}
