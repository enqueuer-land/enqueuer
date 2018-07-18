import {Subscription} from './subscription';
import {SubscriptionModel} from '../models/inputs/subscription-model';
import {Injectable} from 'conditional-injector';
import * as net from 'net';

@Injectable({predicate: (subscriptionAttributes: any) => subscriptionAttributes.type === 'tcp'})
export class TcpSubscription extends Subscription {

    private server: any;
    private response?: string;
    private port: number;

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
            this.server.on('connection', (stream: any) => {
                    stream.on('end', () => {
                        stream.end();
                        reject();
                    });

                    stream.on('data', (msg: any) => {
                        msg = msg.toString();
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
            this.server = net.createServer()
                .listen(this.port, 'localhost', () => {
                    resolve();
                });
        });
    }

    public unsubscribe(): void {
        this.server.close();
    }

}