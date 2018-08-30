import {Subscription} from './subscription';
import {SubscriptionModel} from '../models/inputs/subscription-model';
import {Injectable} from 'conditional-injector';
import * as dgram from 'dgram';
import {Logger} from '../loggers/logger';

@Injectable({predicate: (subscriptionAttributes: any) => subscriptionAttributes.type === 'udp'})
export class UdpSubscription extends Subscription {

    private server: any;
    private port: number;
    private remoteInfo?: any;

    constructor(subscriptionAttributes: SubscriptionModel) {
        super(subscriptionAttributes);
        this.port = subscriptionAttributes.port;

        if (typeof subscriptionAttributes.response != 'string') {
            this.response = JSON.stringify(subscriptionAttributes.response);
        }
    }

    public receiveMessage(): Promise<any> {
        return new Promise((resolve, reject) => {
                this.server.on('error', (err: any) => {
                    reject(err);
                });

                this.server.on('message', (msg: Buffer, remoteInfo: any) => {
                    this.remoteInfo = remoteInfo;
                    resolve({payload: msg, remoteInfo: remoteInfo});
                });
            }
        );
    }

    public subscribe(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.server = dgram.createSocket('udp4');
            try {
                this.server.bind(this.port);
                resolve();
            } catch (err) {
                const message = `Udp server could not listen to ${this.port}`;
                Logger.error(message);
                reject(message);
            }
        });
    }

    public unsubscribe(): void {
        if (this.server) {
            this.server.close();
        }
    }

}