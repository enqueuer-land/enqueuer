import {Publisher} from './publisher';
import {PublisherModel} from '../models/inputs/publisher-model';
import * as net from 'net';
import {Injectable} from 'conditional-injector';
import {Logger} from '../loggers/logger';
import {Store} from '../configurations/store';
import {Json} from '../object-notations/json';
import {Protocol} from '../protocols/protocol';

const tcp = new Protocol('tcp')
    .addAlternativeName('tcp-client')
    .registerAsPublisher();

const uds = new Protocol('uds')
    .addAlternativeName('uds-client')
    .registerAsPublisher();

@Injectable({predicate: (publish: any) => tcp.matches(publish.type) || uds.matches(publish.type)})
export class RawSocketStreamPublisher extends Publisher {

    private readonly loadedStream: any;

    constructor(publisherAttributes: PublisherModel) {
        super(publisherAttributes);
        this.timeout = this.timeout || 1000;
        if (this.loadStream) {
            Logger.debug(`Loading ${this.type} client: ${this.loadStream}`);
            this.loadedStream = Store.getData()[this.loadStream];
        }
    }

    public publish(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.loadStream) {
                this.sendReusingStream(resolve, reject);
            } else {
                this.sendCreatingStream(resolve, reject);
            }

        });
    }

    private sendReusingStream(resolve: any, reject: any) {
        Logger.debug(`Client is trying to reuse ${this.type} stream`);
        if (!this.loadedStream) {
            Logger.error(`There is no ${this.type} stream able to be loaded named ${this.loadStream}`);
            this.sendCreatingStream(resolve, reject);
        } else {
            Logger.debug(`Client is reusing ${this.type} stream`);
            this.publishData(this.loadedStream, resolve, reject);
        }
    }

    private sendCreatingStream(resolve: any, reject: any) {
        Logger.debug(`${this.type} client trying to connect`);
        this.createStream()
            .then((stream: any) => {
                Logger.debug(`${this.type} client connected to: ${this.serverAddress}:${this.port}`);
                this.publishData(stream, resolve, reject);
            }).catch(err => {
                reject(err);
            });
    }

    private createStream(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (tcp.matches(this.type)) {
                const stream = new net.Socket();
                stream.connect(this.port, this.serverAddress, () => {
                    Logger.debug(`${this.type} client connected to: ${this.serverAddress}:${this.port}`);
                    resolve(stream);
                });
                stream.on('error', (error: any) => {
                    reject(error);
                });
            } else {
                resolve(net.createConnection(this.path));
            }
        });
    }

    private publishData(stream: any, resolve: (value?: (PromiseLike<any> | any)) => void, reject: (reason?: any) => void) {
        Logger.debug(`${this.type} client publishing`);
        stream.setTimeout(this.timeout);
        stream.once('error', (data: any) => {
            this.finalize(stream);
            reject(data);
        });
        stream.write(this.stringifyPayload(), () => {
            this.registerEvents(stream, resolve);
            if (this.saveStream) {
                Logger.debug(`Persisting publisher stream ${this.saveStream}`);
                Store.getData()[this.saveStream] = stream;
            }
        });
    }

    private registerEvents(stream: any, resolve: (value?: (PromiseLike<any> | any)) => void) {
        stream.on('timeout', () => {
            this.finalize(stream);
            stream.removeAllListeners('data');
            resolve();
        })
        .once('end', () => {
            this.finalize(stream);
            resolve();
        })
        .on('data', (msg: Buffer) => {
            Logger.debug(`${this.type} client got data '${msg.toString()}'`);
            if (!this.messageReceived) {
                this.messageReceived = {
                    payload: '',
                    stream: stream.address()
                };
            }
            this.messageReceived.payload += msg;
        });
    }

    private finalize(stream: any) {
        if (!this.saveStream) {
            stream.end();
        }
    }

    private stringifyPayload() {
        if (typeof(this.payload) != 'string' && !Buffer.isBuffer(this.payload)) {
            return new Json().stringify(this.payload);
        }
        return this.payload;
    }
}
