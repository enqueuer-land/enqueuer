import {Publisher} from './publisher';
import {PublisherModel} from '../models/inputs/publisher-model';
import * as net from 'net';
import {Injectable} from 'conditional-injector';
import {Logger} from '../loggers/logger';
import {Store} from '../configurations/store';
import {JavascriptObjectNotation} from '../object-notations/javascript-object-notation';
import {ProtocolManager} from '../protocols/protocol-manager';

const protocol = ProtocolManager.getInstance().insertPublisherProtocol('tcp', ['tcp-client']);
@Injectable({predicate: (publish: any) => protocol.matchesRatingAtLeast(publish.type, 95)})
export class TcpClientPublisher extends Publisher {

    private readonly loadedStream: any;

    constructor(publisherAttributes: PublisherModel) {
        super(publisherAttributes);
        this.timeout = this.timeout || 1000;
        if (this.loadStream) {
            Logger.debug(`Loading tcp client: ${this.loadStream}`);
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
        Logger.debug('Client is trying to reuse tcp stream');
        if (!this.loadedStream) {
            Logger.error(`There is no tcp stream able to be loaded named ${this.loadStream}`);
            this.sendCreatingStream(resolve, reject);
        } else {
            Logger.debug('Client is reusing tcp stream');
            this.publishData(this.loadedStream, resolve, reject);
        }
    }

    private sendCreatingStream(resolve: any, reject: any) {
        const stream = new net.Socket();
        Logger.debug('Tcp client trying to connect');
        stream.connect(this.port, this.serverAddress, () => {
            Logger.debug(`Tcp client connected to: ${this.serverAddress}:${this.port}`);
            this.publishData(stream, resolve, reject);
        });
        stream.on('error', (error) => {
            reject(error);
        });
    }

    private publishData(stream: any, resolve: (value?: (PromiseLike<any> | any)) => void, reject: (reason?: any) => void) {
        Logger.debug(`Tcp client publishing`);
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
            Logger.debug(`Tcp client got data '${msg.toString()}'`);
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
            return new JavascriptObjectNotation().stringify(this.payload);
        }
        return this.payload;
    }
}