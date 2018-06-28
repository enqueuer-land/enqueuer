import {Publisher} from './publisher';
import {PublisherModel} from '../models/inputs/publisher-model';
import {Injectable} from 'conditional-injector';
import {Logger} from '../loggers/logger';
const Stomp = require('stomp-client');

@Injectable({predicate: (publishRequisition: any) => publishRequisition.type === 'stomp'})
export class StompPublisher extends Publisher {
    private queue: string;
    private password: string;
    private user: string;
    private port: string;
    private address: string;

    public constructor(publisherProperties: PublisherModel) {
        super(publisherProperties);

        this.address = publisherProperties.address;
        this.port = publisherProperties.port;
        this.user = publisherProperties.user;
        this.password = publisherProperties.password;
        this.queue = publisherProperties.queue;
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