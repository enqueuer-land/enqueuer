import {Subscription} from './subscription';
import {SubscriptionModel} from '../models/inputs/subscription-model';
import {Injectable} from 'conditional-injector';
import * as net from 'net';
import * as tls from 'tls';
import {Logger} from '../loggers/logger';
import {Store} from '../configurations/store';
import {HandlerListener} from '../handlers/handler-listener';
import {Json} from '../object-notations/json';
import {Protocol} from '../protocols/protocol';
import * as fs from 'fs';
import {Timeout} from '../timers/timeout';

const tcp = new Protocol('tcp')
    .addAlternativeName('tcp-server')
    .registerAsSubscription();

const uds = new Protocol('uds')
    .addAlternativeName('uds-server')
    .registerAsSubscription();

const ssl = new Protocol('ssl')
    .addAlternativeName('tls')
    .registerAsSubscription();

const fileStream = new Protocol('file-stream')
    .registerAsSubscription();

@Injectable({
    predicate: (subscription: any) => tcp.matches(subscription.type)
        || ssl.matches(subscription.type)
        || uds.matches(subscription.type)
        || fileStream.matches(subscription.type)
})
export class StreamSubscription extends Subscription {

    private server: any;
    private stream: any;

    constructor(subscriptionAttributes: SubscriptionModel) {
        super(subscriptionAttributes);
        if (this.response && typeof subscriptionAttributes.response != 'string') {
            this.response = new Json().stringify(subscriptionAttributes.response);
        }
    }

    public async receiveMessage(): Promise<any> {
        if (this.loadStream || fileStream.matches(this.type)) {
            return await this.waitForData();
        } else if (ssl.matches(this.type)) {
            await this.sslServerGotConnection;
            return await this.gotConnection(this.stream);
        } else {
            return new Promise((resolve, reject) => {
                this.server.once('connection', (stream: any) => {
                    this.gotConnection(stream)
                        .then((message: any) => resolve(message))
                        .catch((err: any) => reject(err));
                });
            });
        }
    }

    private async gotConnection(stream: any): Promise<any> {
        this.stream = stream;
        Logger.debug(`${this.type} readableStream got a connection ${this.stream}`);
        this.sendGreeting();
        return await this.waitForData();
    }

    public subscribe(): Promise<void> {
        if (this.loadStream) {
            return this.reuseServer();
        } else {
            return this.createServer();
        }
    }

    public async unsubscribe(): Promise<void> {
        this.persistStream();
        if (uds.matches(this.type) && fs.existsSync(this.path)) {
            fs.unlinkSync(this.path);
        }
        if (this.server) {
            this.server.close();
            this.server = null;
        }
        Logger.debug(`${this.type} unsubscribed`);
    }

    public sendResponse(): Promise<void> {
        return new Promise((resolve) => {
            if (this.stream) {
                if (this.stream.write) {
                    Logger.debug(`${this.type} readableStream (${this.stream.localPort}) sending response`);
                    this.stream.write(this.response, () => {
                        Logger.debug(`${this.type} readableStream response sent`);
                        resolve();
                    });
                } else {
                    resolve();
                }
            }
        });
    }

    private reuseServer(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.tryToLoadStream();
                Logger.debug(`${this.type} readableStream is reusing ${this.type} stream running on ${this.stream.localPort}`);
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
            this.createStream()
                .then(() => {
                    Logger.debug(`${this.type} readableStream is ready ${this.port || this.path}`);
                    resolve();
                })
                .catch(err => {
                    const message = `${this.type} readableStream errored ${this.port || this.path}: ${err}`;
                    Logger.error(message);
                    reject(message);
                });
        });
    }

    private createStream(): Promise<void> {
        if (tcp.matches(this.type)) {
            this.server = net.createServer();
            return new HandlerListener(this.server).listen(this.port);
        } else if (ssl.matches(this.type)) {
            this.createSslConnection();
            return new HandlerListener(this.server).listen(this.port);
        } else if (fileStream.matches(this.type)) {
            Logger.debug(`${this.type} creating read stream ${this.path}`);
            this.stream = fs.createReadStream(this.path, this.options);
            return Promise.resolve();
        } else {
            this.server = net.createServer();
            return new HandlerListener(this.server).listen(this.path);
        }
    }

    private createSslConnection() {
        this.sslServerGotConnection = new Promise((resolve, reject) => {
            try {
                this.server = tls.createServer(this.options, (stream) => {
                    this.stream = stream;
                    resolve();
                });
            } catch (err) {
                reject(err);
            }
        });
    }

    private sendGreeting() {
        if (this.greeting && this.stream.write) {
            Logger.debug(`${this.type} readableStream (${this.stream.localPort}) sending greeting message`);
            this.stream.write(this.greeting);
        }
    }

    private tryToLoadStream() {
        Logger.debug(`readableStream is loading ${this.type} stream: ${this.loadStream}`);
        this.stream = Store.getData()[this.loadStream];
        if (this.stream) {
            Logger.debug(`readableStream loaded ${this.type} stream: ${this.loadStream} (${this.stream.localPort})`);
        } else {
            throw `Impossible to load ${this.type} stream: ${this.loadStream}`;
        }
    }

    private waitForData(): Promise<any> {
        return new Promise((resolve, reject) => {
            let message: any = {payload: undefined, stream: this.stream.address ? this.stream.address() : undefined, path: this.path};
            Logger.trace(`${this.type} readableStream is waiting on data`);
            if (this.streamTimeout) {
                new Timeout(() => {
                    Logger.trace(`'Stream timeout' emitted`);
                    this.onEnd(message, resolve, reject);
                }).start(this.streamTimeout);
            } else {
                this.stream.once('end', () => {
                    Logger.trace(`'End' timeout emitted`);
                    this.onEnd(message, resolve, reject);
                });
            }
            this.stream.on('data', (msg: any) => {
                this.onData(msg, message, resolve);
                this.stream.read(0);
            });
        });
    }

    private onEnd(message: any, resolve: any, reject: any) {
        if (message.payload !== undefined) {
            resolve(message);
        } else {
            reject();
        }
    }

    private onData(msg: any, message: any, resolve: any) {
        Logger.debug(`${this.type} readableStream got data ${msg}`);
        if (message.payload === undefined) {
            message.payload = '';
        }
        message.payload += msg;
        if (!this.streamTimeout) {
            resolve(message);
        }
    }

    private persistStream() {
        if (this.stream) {
            if (this.saveStream) {
                Logger.debug(`Persisting subscription ${this.type} stream ${this.saveStream}`);
                Store.getData()[this.saveStream] = this.stream;
                this.saveStream = undefined;
            } else if (typeof (this.stream.end) === 'function') {
                Logger.trace(`Ending ${this.type} stream`);
                this.stream.end();
            }
        }
    }

}
