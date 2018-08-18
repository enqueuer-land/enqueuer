import {Publisher} from './publisher';
import {Logger} from '../loggers/logger';
import {Injectable} from 'conditional-injector';
import {PublisherModel} from '../models/inputs/publisher-model';
import * as zmq from 'zeromq';

@Injectable({predicate: (publishRequisition: any) => publishRequisition.type === 'zero-mq-pub'})
export class ZeroMqPubPublisher extends Publisher {
    private address: string;
    private topic: string;
    private socket: zmq.Socket;

    constructor(publish: PublisherModel) {
        super(publish);
        this.address = publish.address;
        this.topic = publish.topic;
        this.socket = zmq.socket('pub').bindSync(this.address);
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