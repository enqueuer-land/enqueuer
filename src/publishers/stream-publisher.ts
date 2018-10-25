import {Publisher} from './publisher';
import {PublisherModel} from '../models/inputs/publisher-model';
import * as net from 'net';
import {Injectable} from 'conditional-injector';
import {Logger} from '../loggers/logger';
import {Store} from '../configurations/store';
import {Json} from '../object-notations/json';
import {Protocol} from '../protocols/protocol';
import * as tls from 'tls';
import * as fs from 'fs';
import {Timeout} from '../timers/timeout';

const tcp = new Protocol('tcp')
    .addAlternativeName('tcp-client')
    .registerAsPublisher();

const uds = new Protocol('uds')
    .addAlternativeName('uds-client')
    .registerAsPublisher();

const ssl = new Protocol('ssl')
    .addAlternativeName('tls')
    .registerAsPublisher();

const fileStream = new Protocol('file-stream')
    .registerAsPublisher();

@Injectable({predicate: (publish: any) => tcp.matches(publish.type)
        || uds.matches(publish.type)
        || fileStream.matches(publish.type)
        || ssl.matches(publish.type)})
export class StreamPublisher extends Publisher {

    private readonly loadedStream: any;

    constructor(publisherAttributes: PublisherModel) {
        super(publisherAttributes);
        this.timeout = this.streamTimeout;
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
        Logger.info(`${this.type} client is trying to reuse stream ${this.loadStream}`);
        if (!this.loadedStream) {
            Logger.error(`There is no ${this.type} stream able to be loaded named ${this.loadStream}`);
            this.sendCreatingStream(resolve, reject);
        } else {
            Logger.debug(`Client is reusing ${this.type} stream`);
            this.publishData(this.loadedStream, resolve, reject);
        }
    }

    private sendCreatingStream(resolve: any, reject: any) {
        Logger.info(`${this.type} client trying to connect`);
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
                this.createTcpStream(resolve, reject);
            } else if (ssl.matches(this.type)) {
                this.createSslStream(resolve, reject);
            } else if (fileStream.matches(this.type)) {
                this.createFileStream(resolve, reject);
            } else {
                resolve(net.createConnection(this.path));
            }
        });
    }

    private createSslStream(resolve: any, reject: any): void {
        const stream: any = tls.connect(this.port, this.serverAddress, this.options, () => resolve(stream));
        stream.on('error', (error: any) => {
            Logger.error(`${this.type} client error: ${error}`);
            reject(error);
        });
    }

    private createFileStream(resolve: any, reject: any): void {
        const stream: any = fs.createWriteStream(this.path, this.options);
        stream.on('error', (error: any) => {
            Logger.error(`${this.type} client error: ${error}`);
            reject(error);
        });
        resolve(stream);
    }

    private createTcpStream(resolve: any, reject: any): void {
        const stream = new net.Socket();
        stream.connect(this.port, this.serverAddress, () => resolve(stream));
        stream.on('error', (error: any) => {
            Logger.error(`${this.type} client error: ${error}`);
            reject(error);
        });
    }

    private publishData(stream: any, resolve: any, reject: any) {
        Logger.debug(`${this.type} client publishing`);
        stream.once('error', (data: any) => {
            this.finalize(stream);
            reject(data);
        });
        const stringifyPayload = this.stringifyPayload();
        stream.write(stringifyPayload, () => {
            Logger.debug(`${this.type} client published`);
            this.registerEvents(stream, resolve);
            if (this.saveStream) {
                Logger.debug(`Persisting publisher stream ${this.saveStream}`);
                Store.getData()[this.saveStream] = stream;
            }
        });
    }

    private registerEvents(stream: any, resolve: (value?: (PromiseLike<any> | any)) => void) {
        // if (!stream.read) {
        //     Logger.debug(`${this.type} is not a readable stream`);
        //     this.finalize(stream);
        //     resolve();
        // }
        new Timeout(() => {
            this.finalize(stream);
            Logger.debug(`${this.type} client timed out`);
            stream.removeAllListeners('data');
            resolve();
        }).start(this.timeout);

        stream.once('end', () => {
            Logger.debug(`${this.type} client ended`);
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
