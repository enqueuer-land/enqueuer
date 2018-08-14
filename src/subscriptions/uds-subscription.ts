import {Subscription} from './subscription';
import {SubscriptionModel} from '../models/inputs/subscription-model';
import {Injectable} from 'conditional-injector';
import * as net from 'net';
import * as fs from 'fs';
import {Logger} from '../loggers/logger';

@Injectable({predicate: (subscriptionAttributes: any) => subscriptionAttributes.type === 'uds'})
export class UdsSubscription extends Subscription {

    private server: any;
    private path: string;
    private stream?: any;

    constructor(subscriptionAttributes: SubscriptionModel) {
        super(subscriptionAttributes);
        this.path = subscriptionAttributes.path;
        if (typeof subscriptionAttributes.response != 'string') {
            this.response = JSON.stringify(subscriptionAttributes.response);
        }
    }

    public receiveMessage(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.server.on('connection', (stream: any) => {
                this.stream = stream;
                this.stream.once('end', () => {
                    Logger.debug(`Uds server detected stream's end`);
                    reject();
                });

                this.stream.on('data', (msg: any) => {
                    if (!this.response) {
                        this.stream.end();
                    }
                    resolve(msg);
                });

            });
        });
    }

    public async sendResponse(): Promise<void> {
        if (this.stream) {
            Logger.debug(`Uds server sending response`);
            this.stream.write(this.response);
            this.stream.end();
            this.stream = null;
        } else {
            Logger.warning(`No uds response was sent because uds stream is null`);
        }
    }

    public subscribe(): Promise<void> {
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
        if (this.stream) {
            this.stream.end();
            this.stream = null;
        }
        this.server.close();
    }

}