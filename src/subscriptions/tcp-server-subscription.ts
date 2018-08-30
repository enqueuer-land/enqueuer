import {Subscription} from './subscription';
import {SubscriptionModel} from '../models/inputs/subscription-model';
import {Injectable} from 'conditional-injector';
import * as net from 'net';
import {Logger} from '../loggers/logger';
import {Store} from '../configurations/store';

@Injectable({predicate: (subscriptionAttributes: any) => subscriptionAttributes.type === 'tcp-server'})
export class TcpServerSubscription extends Subscription {

    private server: any;
    private port: number;
    private saveStream?: string;
    private loadStreamName: string;
    private greeting: string;
    private stream?: any;

    constructor(subscriptionAttributes: SubscriptionModel) {
        super(subscriptionAttributes);
        this.port = subscriptionAttributes.port;
        this.saveStream = subscriptionAttributes.saveStream;
        this.greeting = subscriptionAttributes.greeting;
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
                    Logger.debug(`Tcp server got a connection`);
                    this.stream = stream;
                    this.sendGreeting();
                    this.waitForData(reject, resolve);
                    this.server.close();
                    this.server = null;
                });
            }

        });
    }

    public subscribe(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.loadStreamName) {
                Logger.debug(`Tcp server is reusing tcp stream running on ${this.stream.localPort}`);
                resolve();
                return;
            }

            try {
            this.server = net.createServer()
                .listen(this.port, 'localhost', () => {
                    Logger.debug(`Tcp server is listening for tcp clients on ${this.port}`);
                    resolve();
                });
            } catch (err) {
                const message = `Tcp server could not listen to port ${this.port}`;
                Logger.error(message);
                reject(message);
            }
        });
    }

    public unsubscribe() {
        if (this.server) {
            this.server.close();
            this.server = null;
        }
    }

    public sendResponse(): Promise<void> {
        return new Promise((resolve) => {
            if (this.stream) {
                Logger.debug(`Tcp server (${this.stream.localPort}) sending response`);
                this.stream.write(this.response, () => {
                    this.persistStream();
                    resolve();
                });
            }
        });
    }

    private sendGreeting() {
        if (this.greeting) {
            Logger.debug(`Tcp server (${this.stream.localPort}) sending greeting message`);
            this.stream.write(this.greeting);
        }
    }

    private loadStream() {
        Logger.debug(`Server is loading tcp stream: ${this.loadStreamName}`);
        this.stream = Store.getData()[this.loadStreamName];
        if (this.stream) {
            Logger.debug(`Server loaded tcp stream: ${this.loadStreamName} (${this.stream.localPort})`);
        } else {
            throw new Error(`Impossible to load tcp stream: ${this.loadStreamName}`);
        }
    }

    private waitForData(reject: Function, resolve: Function) {
        Logger.trace(`Tcp server (${this.stream.localPort}) is waiting on data`);
        this.stream.once('end', () => {
            const message = `Tcp server detected 'end' event`;
            Logger.debug(message);
            reject(message);
        });

        this.stream.once('data', (msg: any) => {
            Logger.debug(`Tcp server (${this.stream.localPort}) got data ${msg}`);
            resolve(msg);
        });

    }

    private persistStream() {
        if (this.saveStream) {
            Logger.debug(`Persisting subscription tcp stream ${this.saveStream} (${this.stream.localPort})`);
            Store.getData()[this.saveStream] = this.stream;
            this.saveStream = undefined;
        } else {
            Logger.trace(`Ending TCP stream (${this.stream.localPort})`);
            this.stream.end();
        }
    }

}