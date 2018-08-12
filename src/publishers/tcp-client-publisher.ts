import {Publisher} from './publisher';
import {PublisherModel} from '../models/inputs/publisher-model';
import * as net from 'net';
import {Injectable} from 'conditional-injector';
import {Logger} from '../loggers/logger';
import {isNullOrUndefined} from 'util';
import {Store} from '../testers/store';

@Injectable({predicate: (publishRequisition: any) => publishRequisition.type === 'tcp-client'})
export class TcpClientPublisher extends Publisher {

    private serverAddress: string;
    private port: number;
    private saveStream: string;
    private loadStream: string;
    private loadedStream: any;
    private timeout: number;

    constructor(publisherAttributes: PublisherModel) {
        super(publisherAttributes);
        this.serverAddress = publisherAttributes.serverAddress;
        this.port = publisherAttributes.port;
        this.saveStream = publisherAttributes.saveStream;
        this.loadStream = publisherAttributes.loadStream;
        this.timeout = publisherAttributes.timeout || 100;
        if (publisherAttributes.loadStream) {
            Logger.debug(`Loading tcp client: ${this.loadStream}`);
            this.loadedStream = Store.getData()[publisherAttributes.loadStream];
        }
    }

    public publish(): Promise<void> {
        return new Promise((resolve, reject) => {

            if (this.loadStream) {
                Logger.debug('Client is trying to reuse tcp stream');
                if (!this.loadedStream) {
                    return new Error(`There is no tcp stream able to be loaded named ${this.loadStream}`);
                }
                Logger.debug('Client is reusing tcp stream');
                this.publishData(this.loadedStream, resolve, reject);
            } else {
                const stream = new net.Socket();
                Logger.debug('Tcp client trying to connect');
                stream.connect(this.port, this.serverAddress, () => {
                    Logger.debug(`Tcp client connected to: ${this.serverAddress}:${this.port}`);
                    this.publishData(stream, resolve, reject);
                });
            }

        });
    }

    private publishData(stream: any, resolve: (value?: (PromiseLike<any> | any)) => void, reject: (reason?: any) => void) {
        Logger.debug(`Tcp client publishing`);

        stream.setTimeout(this.timeout);
        stream.on('timeout', () => {
            Logger.debug(`Tcp client detected 'timeout' event`);
            if (!this.saveStream) {
                stream.end();
            }
            stream.removeAllListeners('data');
            resolve(this.messageReceived);
        })
        .once('error', (data: any) => {
            if (!this.saveStream) {
                stream.end();
            }
            reject(data);
        })
        .once('end', () => {
            Logger.debug(`Tcp client detected 'end' event`);
            if (!this.saveStream) {
                stream.end();
            }
            resolve();
        })
        .on('data', (msg: Buffer) => {
            Logger.debug(`Tcp client got data '${msg.toString()}'`);
            if (isNullOrUndefined(this.messageReceived)) {
                this.messageReceived = '';
            }
            this.messageReceived += msg.toString();
        });
        stream.write(this.payload, () => {
            if (this.saveStream) {
                Logger.debug(`Persisting publisher stream ${this.saveStream}`);
                Store.getData()[this.saveStream] = stream;
            }
        });
    }
}