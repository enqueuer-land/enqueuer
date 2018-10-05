import {Publisher} from './publisher';
import {Logger} from '../loggers/logger';
import {Injectable} from 'conditional-injector';
import {PublisherModel} from '../models/inputs/publisher-model';
import * as zmq from 'zeromq';

@Injectable({predicate: (publish: any) => publish.type === 'zero-mq-pub'
                        || publish.type === 'zeromq'})
export class ZeroMqPubPublisher extends Publisher {

    constructor(publish: PublisherModel) {
        super(publish);
        this.socket = zmq.socket('pub');
        this.socket
            .monitor(150, 0)
            .bindSync(this.address);
    }

    public publish(): Promise<void> {
        return new Promise((resolve) => {
                Logger.debug(`Publishing to zeroMq socket topic ${this.topic} and message ${this.payload}`);
                this.socket = this.socket.send([this.topic, this.payload]);
                this.socket.unbindSync(this.address);
                this.socket.close();
                resolve();
        });
    }
}