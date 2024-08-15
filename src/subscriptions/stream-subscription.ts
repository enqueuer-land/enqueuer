import { Subscription } from './subscription';
import { SubscriptionModel } from '../models/inputs/subscription-model';
import * as net from 'net';
import * as tls from 'tls';
import { Logger } from '../loggers/logger';
import { Store } from '../configurations/store';
import { HandlerListener } from '../handlers/handler-listener';
import * as fs from 'fs';
import { Timeout } from '../timers/timeout';
import { MainInstance } from '../plugins/main-instance';
import { SubscriptionProtocol } from '../protocols/subscription-protocol';
import { ProtocolDocumentation } from '../protocols/protocol-documentation';

export class StreamSubscription extends Subscription {

    private server: any;
    private stream: any;
    private sslServerGotConnection?: Promise<void>;

    constructor(subscriptionAttributes: SubscriptionModel) {
        super(subscriptionAttributes);
        this.type = this.type.toLowerCase();
        if (this.response && typeof subscriptionAttributes.response != 'string') {
            this.response = JSON.stringify(subscriptionAttributes.response, null, 2);
        }
    }

    public async receiveMessage(): Promise<void> {
        if (this.loadStream) {
            return await this.waitForData();
        } else if ('ssl' === (this.type || '').toLowerCase()) {
            await this.sslServerGotConnection;
            return await this.gotConnection(this.stream);
        } else {
            return new Promise((resolve, reject) => {
                this.server.once('connection', (stream: any) => {
                    this.gotConnection(stream)
                        .then(() => resolve())
                        .catch((err: any) => reject(err));
                });
            });
        }
    }

    private async gotConnection(stream: any): Promise<void> {
        this.stream = stream;
        Logger.debug(`${this.type} readableStream got a connection ${this.stream}`);
        this.sendGreeting();
        await this.waitForData();
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
        if ('uds' === (this.type || '').toLowerCase() && fs.existsSync(this.path)) {
            fs.unlinkSync(this.path);
        }
        if (this.server) {
            this.server.close();
            this.server = null;
        }
        Logger.debug(`${this.type} unsubscribed`);
    }

    public sendResponse(): Promise<void> {
        if (!this.response) {
            return Promise.resolve();
        }
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
                Logger.error(`Stream subscription errored: ` + err);
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
        if ('tcp' === (this.type || '').toLowerCase()) {
            this.server = net.createServer();
            return new HandlerListener(this.server).listen(this.port);
        } else if ('ssl' === (this.type || '').toLowerCase()) {
            this.createSslConnection();
            return new HandlerListener(this.server).listen(this.port);
        } else {
            this.server = net.createServer();
            return new HandlerListener(this.server).listen(this.path);
        }
    }

    private async createSslConnection() {
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

    private waitForData(): Promise<void> {
        return new Promise((resolve, reject) => {
            let message: any = {
                payload: undefined,
                stream: this.stream.address ? this.stream.address() : undefined,
                path: this.path
            };
            Logger.trace(`${this.type} readableStream is waiting on data`);
            if (this.streamTimeout) {
                new Timeout(() => {
                    Logger.trace(`Readable 'stream timeout' emitted`);
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
            });
        });
    }

    // ssl 8 - 8

    private onEnd(message: any, resolve: any, reject: any) {
        if (message.payload !== undefined) {
            this['finished'] = true;
            if (!this.finished) {
                this.executeHookEvent('onMessageReceived', message);
            }
            resolve();
        } else {
            reject();
        }
    }

    private onData(msg: any, message: any, resolve: any) {
        if (!this.finished) {
            Logger.debug(`'${this.type}' readableStream got data '${msg}'`);
            if (message.payload === undefined) {
                message.payload = '';
            }
            message.payload += msg;
            if (!this.streamTimeout) {
                this['finished'] = true;
                this.executeHookEvent('onMessageReceived', message);
                resolve();
            }
        }
    }

    private persistStream() {
        if (this.stream) {
            if (this.saveStream) {
                Logger.debug(`Persisting subscription ${this.type} stream ${this.saveStream}`);
                Store.getData()[this.saveStream] = this.stream;
                this['saveStream'] = undefined;
            } else if (typeof (this.stream.end) === 'function') {
                Logger.trace(`Ending ${this.type} stream`);
                this.stream.end();
            }
        }
    }

}

export function entryPoint(mainInstance: MainInstance): void {
    const createFunction = (subscriptionModel: SubscriptionModel) => new StreamSubscription(subscriptionModel);
    const docs: ProtocolDocumentation = {
        description: 'The stream subscription provides implementations of TCP/UDS servers',
        libraryHomepage: 'https://nodejs.org/api/net.html',
        schema: {
            attributes: {
                response: {
                    required: true,
                    type: 'text'
                },
                greeting: {
                    required: false,
                    type: 'text'
                },
                port: {
                    description: 'Defined when using TCP',
                    required: false,
                    type: 'int'
                },
                path: {
                    description: 'Defined when using UDS',
                    required: false,
                    type: 'string'
                },
                saveStream: {
                    description: 'Set it when you want to reuse this stream',
                    required: false,
                    type: 'string'
                },
                loadStream: {
                    description: 'Set it when you want to reuse an opened stream',
                    required: false,
                    type: 'string'
                },
                streamTimeout: {
                    description: 'Timeout to stop listening after the first byte is read',
                    required: false,
                    type: 'int'
                },
                options: {
                    description: 'Defined when using SSL. https://nodejs.org/api/net.html#net_net_createserver_options_connectionlistener',
                    required: false,
                    type: 'object'
                },
            },
            hooks: {
                onMessageReceived: {
                    arguments: {
                        payload: {},
                        stream: {},
                        path: {
                            description: 'Defined only when it is a UDS server',
                        }
                    }
                }
            }
        }
    };
    const tcp = new SubscriptionProtocol('tcp', createFunction, docs);

    const uds = new SubscriptionProtocol('uds', createFunction, docs);

    const ssl = new SubscriptionProtocol('ssl', createFunction, docs);

    mainInstance.protocolManager.addProtocol(tcp);
    mainInstance.protocolManager.addProtocol(uds);
    mainInstance.protocolManager.addProtocol(ssl);
}
