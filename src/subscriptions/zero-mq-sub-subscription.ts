import {Subscription} from './subscription';
import {SubscriptionModel} from '../models/inputs/subscription-model';
import {Injectable} from 'conditional-injector';
import {Logger} from '../loggers/logger';
import * as zmq from 'zeromq';

@Injectable({predicate: (subscriptionAttributes: any) => subscriptionAttributes.type === 'zero-mq-sub'})
export class ZeroMqSubSubscription extends Subscription {
    private address: string;
    private topic: string;
    private socket: zmq.Socket;

    constructor(subscriptionModel: SubscriptionModel) {
        super(subscriptionModel);
        this.address = subscriptionModel.address;
        this.topic = subscriptionModel.topic;
        this.socket = zmq.socket('sub');
    }

    public receiveMessage(): Promise<any> {
        return new Promise((resolve) => {
            Logger.trace(`ZeroMqSub waiting for a message related to topic ${this.topic}`);
            this.socket.on('message', (topic: Buffer, message: Buffer) => {
                Logger.debug(`ZeroMqSub received a message related to topic ${topic.toString()}`);

                resolve({topic: topic, payload: message});
            });
        });
    }

    public connect(): Promise<void> {
        Logger.trace(`ZeroMqSub trying to connect to zeroMq ${this.address}`);
        this.socket = this.socket.connect(this.address);
        this.socket = this.socket.subscribe(this.topic);
        Logger.debug(`ZeroMqSub connected to zeroMq ${this.address}`);
        return Promise.resolve();
    }

    public unsubscribe(): void {
        this.socket.close();
    }

}