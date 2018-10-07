import {Publisher} from './publisher';
import {PublisherModel} from '../models/inputs/publisher-model';
import {Injectable} from 'conditional-injector';
import {Logger} from '../loggers/logger';
import {Protocol} from '../protocols/protocol';
const Stomp = require('stomp-client');

const protocol = new Protocol('stomp')
    .setLibrary('stomp-client')
    .registerAsPublisher();

@Injectable({predicate: (publish: any) => protocol.matches(publish.type)})
export class StompPublisher extends Publisher {

    public constructor(publisherProperties: PublisherModel) {
        super(publisherProperties);
    }

    public publish(): Promise<void> {
        return new Promise((resolve, reject) => {
            const client = new Stomp(this.address, this.port, this.user, this.password);
            client.connect((sessionId: string) => {
                Logger.debug(`Stomp publisher connected id ${sessionId}`);
                client.publish(this.queue, this.payload);
                resolve();
            }, (err: any) => {
                Logger.error(`Error connecting to stomp to publish: ${err}`);
                reject(err);
            });
        });
    }

}