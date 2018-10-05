import {Subscription} from './subscription';
import {SubscriptionModel} from '../models/inputs/subscription-model';
import {Injectable} from 'conditional-injector';
import * as net from 'net';
import {Logger} from '../loggers/logger';
import {Store} from '../configurations/store';
import {HandlerListener} from '../handlers/handler-listener';
import {JavascriptObjectNotation} from '../object-notations/javascript-object-notation';
import {ProtocolManager} from '../protocols/protocol-manager';

const protocol = ProtocolManager
    .getInstance()
    .insertSubscriptionProtocol('tcp',
        ['tcp-server']);
@Injectable({predicate: (publish: any) => protocol.matchesRatingAtLeast(publish.type, 95)})
export class TcpServerSubscription extends Subscription {

    private server: any;
    private stream: any;

    constructor(subscriptionAttributes: SubscriptionModel) {
        super(subscriptionAttributes);
        if (typeof subscriptionAttributes.response != 'string') {
            this.response = new JavascriptObjectNotation().stringify(subscriptionAttributes.response);
        }
    }

    public receiveMessage(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (this.loadStream) {
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
        if (this.loadStream) {
            return this.reuseServer();
        } else {
            return this.createServer();
        }
    }

    public async unsubscribe(): Promise<void> {
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

    private reuseServer(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.tryToLoadStream();
                Logger.debug(`Tcp server is reusing tcp stream running on ${this.stream.localPort}`);
                resolve();
            } catch (err) {
                Logger.error(err);
                this.createServer()
                    .then(() => resolve())
                    .catch((err) => reject(err));
            }

        });
    }

    private createServer(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.server = net.createServer();
            new HandlerListener(this.server).listen(this.port)
                .then(() => {
                    Logger.debug(`Tcp server is listening for tcp clients on ${this.port}`);
                    resolve();
                })
                .catch(err => {
                    const message = `Tcp server could not listen to port ${this.port}: ${err}`;
                    Logger.error(message);
                    reject(message);
                });
        });
    }

    private sendGreeting() {
        if (this.greeting) {
            Logger.debug(`Tcp server (${this.stream.localPort}) sending greeting message`);
            this.stream.write(this.greeting);
        }
    }

    private tryToLoadStream() {
        Logger.debug(`Server is loading tcp stream: ${this.loadStream}`);
        this.stream = Store.getData()[this.loadStream];
        if (this.stream) {
            Logger.debug(`Server loaded tcp stream: ${this.loadStream} (${this.stream.localPort})`);
        } else {
            throw `Impossible to load tcp stream: ${this.loadStream}`;
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
            resolve({payload: msg, stream: this.stream.address()});
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