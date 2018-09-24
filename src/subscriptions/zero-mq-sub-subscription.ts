import {Subscription} from './subscription';
import {SubscriptionModel} from '../models/inputs/subscription-model';
import {Injectable} from 'conditional-injector';
import {Logger} from '../loggers/logger';
import * as zmq from 'zeromq';

@Injectable({predicate: (subscriptionAttributes: any) => subscriptionAttributes.type === 'zero-mq-sub'})
export class ZeroMqSubSubscription extends Subscription {
    private socket: zmq.Socket;

    constructor(subscriptionModel: SubscriptionModel) {
        super(subscriptionModel);
        this.socket = zmq.socket('sub');
    }

    public receiveMessage(): Promise<any> {
        return new Promise((resolve) => {
            Logger.trace(`ZeroMqSub waiting for a message in topic ${this.topic}`);
            this.socket.on('message', (topic: Buffer, message: Buffer) => {
                Logger.debug(`ZeroMqSub received a message in topic ${topic.toString()}`);
                this.socket.unsubscribe(this.topic);
                this.socket.disconnect(this.address);
                this.socket.close();
                resolve({topic: topic, payload: message});
            });
        });
    }

    public subscribe(): Promise<void> {
        return new Promise((resolve) => {

            Logger.trace(`Trying to subscribe to zeroMq ${this.address}`);
            this.socket.on('connect', () => {
                Logger.debug(`Zeromq sub emitted: 'connect'`);
                resolve();
            });
            this.socket
                .monitor(150, 0)
                .connect(this.address)
                .subscribe(this.topic);
        });

    }

}