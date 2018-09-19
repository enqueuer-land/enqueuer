import {Subscription} from './subscription';
import {SubscriptionModel} from '../models/inputs/subscription-model';
import {Injectable} from 'conditional-injector';
import * as net from 'net';
import * as fs from 'fs';
import {Logger} from '../loggers/logger';
import {Store} from '../configurations/store';
import {HandlerListener} from '../handlers/handler-listener';

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
                    if (fs.existsSync(this.path)) {
                        fs.unlinkSync(this.path);
                    }
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
                    Logger.error(`No uds stream able for being reused`);
                    return this.createServer(resolve, reject);
                }
                resolve();
                return;
            }
            this.createServer(resolve, reject);
        });
    }

    private createServer(resolve: any, reject: any) {
        this.server = net.createServer();
        new HandlerListener(this.server)
            .listen(this.path)
            .then(() => {
                Logger.debug(`Uds server is listening for uds clients on ${this.path}`);
                resolve();
            })
            .catch(err => {
                const message = `Uds server could not listen to ${this.path}: ${err}`;
                Logger.error(message);
                reject(message);
            });
    }

    private waitForData(resolve: any) {
        this.stream.once('end', () => {
            Logger.debug(`Uds server detected stream's end`);
            resolve();
            return;
        });

        this.stream.on('data', (msg: any) => {
            Logger.debug(`Uds server got data`);
            resolve({payload: msg});
        });
    }

    public sendResponse(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.stream) {
                Logger.debug(`Uds server sending response`);
                const response = this.stringifyPayload(this.response);
                this.stream.write(response, () => {
                    Logger.debug(`Uds server response sent`);
                    resolve();
                });
            } else {
                const message = `No uds response was sent because uds stream is null`;
                Logger.warning(message);
                reject(message);
            }
        });
    }

    public async unsubscribe(): Promise<void> {
        if (this.server && fs.existsSync(this.path)) {
            fs.unlinkSync(this.path);
        }
        this.persistStream();
    }

    private stringifyPayload(payload: any): string | Buffer {
        if (typeof(payload) != 'string' && !Buffer.isBuffer(payload)) {
            return JSON.stringify(payload);
        }
        return payload;
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