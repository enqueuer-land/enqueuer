import {Subscription} from './subscription';
import {SubscriptionModel} from '../models/inputs/subscription-model';
import {Injectable} from 'conditional-injector';
import * as net from 'net';
import * as fs from 'fs';
import {Logger} from '../loggers/logger';
import {Store} from '../testers/store';

@Injectable({predicate: (subscriptionAttributes: any) => subscriptionAttributes.type === 'uds'})
export class UdsSubscription extends Subscription {

    private server: any;
    private path: string;
    private stream?: any;
    private saveStream: any;
    private loadStream: string;

    constructor(subscriptionAttributes: SubscriptionModel) {
        super(subscriptionAttributes);
        this.path = subscriptionAttributes.path;
        if (typeof subscriptionAttributes.response != 'string') {
            this.response = JSON.stringify(subscriptionAttributes.response);
        }
        this.loadStream = subscriptionAttributes.loadStream;
        this.saveStream = subscriptionAttributes.saveStream;
    }

    public receiveMessage(): Promise<any> {
        return new Promise((resolve) => {
            if (this.stream) {
                this.waitForData(resolve);
            } else {
                this.server.on('connection', (stream: any) => {
                    this.server.close();
                    this.server = null;
                    this.stream = stream;
                    this.waitForData(resolve);
                });
            }
        });
    }

    public subscribe(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.loadStream) {
                Logger.debug(`Server is trying to reuse uds stream: ${this.loadStream}`);
                this.stream = Store.getData()[this.loadStream];
                if (!this.stream) {
                    reject(`No uds stream able for being reused`);
                }
                resolve();
                return;
            }
            fs.unlink(this.path, () => {
                this.server = net.createServer()
                    .listen(this.path, () => {
                        resolve();
                    });
            });
        });
    }

    private waitForData(resolve: any) {
        this.stream.once('end', () => {
            Logger.debug(`Uds server detected stream's end`);
            this.persistStream();
            resolve();
            return;
        });

        this.stream.on('data', (msg: any) => {
            Logger.debug(`Uds server got data`);
            if (!this.response) {
                this.persistStream();
            }
            resolve(msg);
        });
    }

    public sendResponse(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.stream) {
                Logger.debug(`Uds server sending response`);
                this.stream.write(this.response, () => {
                    Logger.debug(`Uds server response sent`);
                    this.persistStream();
                    resolve();
                });
            } else {
                const message = `No uds response was sent because uds stream is null`;
                Logger.warning(message);
                reject(message);
            }
        });
    }

    private persistStream() {
        if (this.saveStream) {
            this.stream.removeAllListeners('data');
            this.stream.removeAllListeners('connect');
            this.stream.removeAllListeners('error');
            this.stream.removeAllListeners('end');
            Logger.debug(`Uds server saving stream: ${this.saveStream}`);
            Store.getData()[this.saveStream] = this.stream;
        } else {
            if (this.stream) {
                this.stream.end();
                this.stream = null;
            }
        }
    }

}