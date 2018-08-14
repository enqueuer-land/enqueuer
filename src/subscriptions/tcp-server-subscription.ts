import {Subscription} from './subscription';
import {SubscriptionModel} from '../models/inputs/subscription-model';
import {Injectable} from 'conditional-injector';
import * as net from 'net';
import {Logger} from '../loggers/logger';
import {Store} from '../testers/store';

@Injectable({predicate: (subscriptionAttributes: any) => subscriptionAttributes.type === 'tcp-server'})
export class TcpServerSubscription extends Subscription {

    private server: any;
    private port: number;
    private saveStream?: string;
    private loadStreamName: string;
    private greetingResponse: string;
    private stream?: any;

    constructor(subscriptionAttributes: SubscriptionModel) {
        super(subscriptionAttributes);
        this.port = subscriptionAttributes.port;
        this.saveStream = subscriptionAttributes.saveStream;
        this.greetingResponse = subscriptionAttributes.greetingResponse;
        if (typeof subscriptionAttributes.response != 'string') {
            this.response = JSON.stringify(subscriptionAttributes.response);
        }
        this.loadStreamName = subscriptionAttributes.loadStream;
        if (this.loadStreamName) {
            this.loadStream();
        }
    }

    public receiveMessage(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (this.loadStreamName) {
                this.waitForData(reject, resolve);
            } else {
                this.server.once('connection', (stream: any) => {
                    this.stream = stream;
                    if (this.greetingResponse) {
                        Logger.debug(`Tcp server sending greeting message`);
                        this.stream.write(this.greetingResponse);
                    }
                    this.waitForData(reject, resolve);

                    this.server.close();
                    this.server = null;
                });
            }

        });
    }

    public subscribe(): Promise<void> {
        return new Promise((resolve) => {
            if (this.loadStreamName) {
                Logger.debug('Server is reusing tcp stream');
                resolve();
                return;
            }

            this.server = net.createServer()
                .listen(this.port, 'localhost', () => {
                    Logger.debug(`Tcp server is listening for tcp clients`);
                    resolve();
                });
        });
    }

    public sendResponse() {
        if (this.stream) {
            Logger.debug(`Tcp server sending response`);
            this.stream.write(this.response, () => this.persistStream());
        }
    }

    private loadStream() {
        Logger.debug(`Server is loading tcp stream: ${this.loadStreamName}`);
        this.stream = Store.getData()[this.loadStreamName];
        if (this.stream) {
            Logger.debug(`Server loaded tcp stream: ${this.loadStreamName}`);
        } else {
            throw new Error(`Impossible to load tcp stream: ${this.loadStreamName}`);
        }
    }

    private waitForData(reject: Function, resolve: Function) {
        Logger.trace(`Tcp server is waiting on data`);
        this.stream.once('end', () => {
            Logger.debug(`Tcp server detected 'end' event`);
            reject();
        });

        this.stream.once('data', (msg: any) => {
            Logger.debug(`Tcp server got data ${msg}`);
            resolve(msg);
        });

    }

    private persistStream() {
        if (this.saveStream) {
            Logger.debug(`Persisting subscription tcp stream ${this.saveStream}`);
            Store.getData()[this.saveStream] = this.stream;
            this.saveStream = undefined;
        } else {
            Logger.trace(`Ending TCP stream`);
            this.stream.end();
        }
    }

}