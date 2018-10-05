import {Publisher} from './publisher';
import {PublisherModel} from '../models/inputs/publisher-model';
import {Injectable} from 'conditional-injector';
import {Logger} from '../loggers/logger';
import {ProtocolsManager} from '../configurations/protocols-manager';
const Stomp = require('stomp-client');

@Injectable({predicate: (publish: any) => ProtocolsManager
        .insertPublisherProtocol('stomp', [], 'stomp-client')
        .matchesRatingAtLeast(publish.type, 95)})
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