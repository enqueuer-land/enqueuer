import {Subscription} from './subscription';
import {SubscriptionModel} from '../models/inputs/subscription-model';
import {Injectable} from 'conditional-injector';
import * as net from 'net';
import * as fs from 'fs';

@Injectable({predicate: (subscriptionAttributes: any) => subscriptionAttributes.type === 'uds'})
export class UdsSubscription extends Subscription {

    private server: any;
    private path: string;
    private response?: string;

    constructor(subscriptionAttributes: SubscriptionModel) {
        super(subscriptionAttributes);
        this.path = subscriptionAttributes.path;
        if (typeof subscriptionAttributes.response != 'string') {
            this.response = JSON.stringify(subscriptionAttributes.response);
        } else {
            this.response = subscriptionAttributes.response;
        }
    }

    public receiveMessage(): Promise<string> {
        return new Promise((resolve, reject) => {
            this.server.on('connection', (stream: any) => {
                    stream.on('end', () => {
                        stream.end();
                        reject();
                    });

                    stream.on('data', (msg: any) => {
                        msg = msg.toString();
                        // console.log('UDS response: ' + this.response + ' -> ' + typeof  this.response);
                        if (this.response) {
                            stream.write(this.response);
                        }
                        stream.end();
                        resolve(msg);
                    });

                });
        });
    }

    public connect(): Promise<void> {
        return new Promise((resolve) => {
            fs.unlink(this.path, () => {
                this.server = net.createServer()
                    .listen(this.path, () => {
                        resolve();
                    });
            });

        });
    }

    public unsubscribe(): void {
        this.server.close();
    }

}