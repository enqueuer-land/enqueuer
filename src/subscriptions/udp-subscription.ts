import {Subscription} from './subscription';
import {SubscriptionModel} from '../models/inputs/subscription-model';
import {Injectable} from 'conditional-injector';
import * as dgram from 'dgram';

@Injectable({predicate: (subscriptionAttributes: any) => subscriptionAttributes.type === 'udp'})
export class UdpSubscription extends Subscription {

    private server: any;
    private port: number;
    private response?: string;

    constructor(subscriptionAttributes: SubscriptionModel) {
        super(subscriptionAttributes);
        this.port = subscriptionAttributes.port;

        if (typeof subscriptionAttributes.response != 'string') {
            this.response = JSON.stringify(subscriptionAttributes.response);
        } else {
            this.response = subscriptionAttributes.response;
        }
    }

    public receiveMessage(): Promise<string> {
        return new Promise((resolve, reject) => {
            this.server.on('error', (err: any) => {
                reject(err);
            });

            this.server.on('message', (msg: Buffer, rinfo: any) => {
                if (this.response) {
                    this.server.send(this.response, rinfo.port, rinfo.address, (error: any) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(msg.toString());
                        }
                    });
                } else {
                    resolve(msg.toString());
                }
            });
        });
    }

    public connect(): Promise<void> {
        return new Promise((resolve) => {
            this.server = dgram.createSocket('udp4');
            this.server.bind(this.port);
            resolve();
        });
    }

    public unsubscribe(): void {
        this.server.close();
    }

}