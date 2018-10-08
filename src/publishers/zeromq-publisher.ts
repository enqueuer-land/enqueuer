import {Publisher} from './publisher';
import {Logger} from '../loggers/logger';
import {Injectable} from 'conditional-injector';
import {PublisherModel} from '../models/inputs/publisher-model';
import * as zmq from 'zeromq';
import {Protocol} from '../protocols/protocol';
import {Timeout} from '../timers/timeout';

const protocol = new Protocol('zeromq')
    .addAlternativeName('zeromq-pub')
    .setLibrary('zeromq')
    .registerAsPublisher();

@Injectable({predicate: (publish: any) => protocol.matches(publish.type)})
export class ZeromqPublisher extends Publisher {

    constructor(publish: PublisherModel) {
        super(publish);
        this.socket = zmq.socket('pub');
        if (this.subscriptionTimeout === undefined) {
            this.subscriptionTimeout = 0;
        }
        this.socket.on('accept', () => {
            Logger.trace(`Zeromq-pub detected subscription`);
            if (this.waitingForListeners) {
                this.send();
            } else {
                this.accepted = true;
            }
        });
        this.socket
            .monitor(150, 0)
            .bindSync(this.address);

    }

    public publish(): Promise<void> {
        return new Promise((resolve) => {
            this.waitingForListeners = true;
            this.publishResolver = resolve;
            if (this.accepted) {
                this.send();
            } else {
                new Timeout(() => {
                    Logger.debug(`ZeroMq detected no subscriptions. Publishing anyway`);
                    this.send();
                }).start(this.subscriptionTimeout);
            }
        });
    }

    private send() {
        this.send = () => {
            /*do nothing*/
        };
        Logger.debug(`Publishing to zeroMq socket topic ${this.topic} and message ${this.payload}`);
        this.socket = this.socket.send([this.topic, this.payload]);
        this.socket.unbindSync(this.address);
        this.socket.close();
        this.publishResolver();
    }
}