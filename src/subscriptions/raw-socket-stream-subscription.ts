import {Subscription} from './subscription';
import {SubscriptionModel} from '../models/inputs/subscription-model';
import {Injectable} from 'conditional-injector';
import * as net from 'net';
import {Logger} from '../loggers/logger';
import {Store} from '../configurations/store';
import {HandlerListener} from '../handlers/handler-listener';
import {Json} from '../object-notations/json';
import {Protocol} from '../protocols/protocol';
import * as fs from 'fs';

const tcp = new Protocol('tcp')
    .addAlternativeName('tcp-server')
    .registerAsSubscription();

const uds = new Protocol('uds')
    .addAlternativeName('uds-server')
    .registerAsSubscription();

@Injectable({predicate: (subscription: any) => tcp.matches(subscription.type) || uds.matches(subscription.type)})
export class RawSocketStreamSubscription extends Subscription {

    private server: any;
    private stream: any;

    constructor(subscriptionAttributes: SubscriptionModel) {
        super(subscriptionAttributes);
        if (typeof subscriptionAttributes.response != 'string') {
            this.response = new Json().stringify(subscriptionAttributes.response);
        }
    }

    public receiveMessage(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (this.loadStream) {
                this.waitForData(reject, resolve);
            } else {
                this.server.once('connection', (stream: any) => {
                    Logger.debug(`${this.type} server got a connection`);
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
        if (uds.matches(this.type) && fs.existsSync(this.path)) {
            fs.unlinkSync(this.path);
        }
        if (this.server) {
            this.server.close();
            this.server = null;
        }
    }

    public sendResponse(): Promise<void> {
        return new Promise((resolve) => {
            if (this.stream) {
                Logger.debug(`${this.type} server (${this.stream.localPort}) sending response`);
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
                Logger.debug(`${this.type} server is reusing ${this.type} stream running on ${this.stream.localPort}`);
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
            const handlerListener = new HandlerListener(this.server);
            let listenPromise;
            if (tcp.matches(this.type)) {
                listenPromise = handlerListener.listen(this.port);
            } else {
                listenPromise = handlerListener.listen(this.path);
            }
            listenPromise
                .then(() => {
                    Logger.debug(`${this.type} server is listening for ${this.type} clients on ${this.port}`);
                    resolve();
                })
                .catch(err => {
                    const message = `${this.type} server could not listen to port ${this.port}: ${err}`;
                    Logger.error(message);
                    reject(message);
                });
        });
    }

    private sendGreeting() {
        if (this.greeting) {
            Logger.debug(`${this.type} server (${this.stream.localPort}) sending greeting message`);
            this.stream.write(this.greeting);
        }
    }

    private tryToLoadStream() {
        Logger.debug(`Server is loading ${this.type} stream: ${this.loadStream}`);
        this.stream = Store.getData()[this.loadStream];
        if (this.stream) {
            Logger.debug(`Server loaded ${this.type} stream: ${this.loadStream} (${this.stream.localPort})`);
        } else {
            throw `Impossible to load ${this.type} stream: ${this.loadStream}`;
        }
    }

    private waitForData(reject: Function, resolve: Function) {
        Logger.trace(`${this.type} server is waiting on data`);
        this.stream.once('end', () => {
            const message = `${this.type} server detected 'end' event`;
            Logger.debug(message);
            reject(message);
        });

        this.stream.once('data', (msg: any) => {
            Logger.debug(`${this.type} server (${this.stream.localPort}) got data ${msg}`);
            resolve({payload: msg, stream: this.stream.address()});
        });

    }

    private persistStream() {
        if (this.saveStream) {
            Logger.debug(`Persisting subscription ${this.type} stream ${this.saveStream}`);
            Store.getData()[this.saveStream] = this.stream;
            this.saveStream = undefined;
        } else {
            Logger.trace(`Ending ${this.type} stream`);
            this.stream.end();
        }
    }

}
