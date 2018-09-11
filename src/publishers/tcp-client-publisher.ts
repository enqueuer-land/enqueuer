import {Publisher} from './publisher';
import {PublisherModel} from '../models/inputs/publisher-model';
import * as net from 'net';
import {Injectable} from 'conditional-injector';
import {Logger} from '../loggers/logger';
import {Store} from '../configurations/store';

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
        this.timeout = publisherAttributes.timeout || 1000;
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
                stream.on('error', (error) => {
                    reject(error);
                });
            }

        });
    }

    private publishData(stream: any, resolve: (value?: (PromiseLike<any> | any)) => void, reject: (reason?: any) => void) {
        Logger.debug(`Tcp client publishing`);
        stream.setTimeout(this.timeout);
        stream.on('timeout', () => {
            this.finalize(stream);
            stream.removeAllListeners('data');
            resolve();
        })
        .once('error', (data: any) => {
            this.finalize(stream);
            reject(data);
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
        this.write(stream);
    }

    private write(stream: any) {
        stream.write(this.payload, () => {
            if (this.saveStream) {
                Logger.debug(`Persisting publisher stream ${this.saveStream}`);
                Store.getData()[this.saveStream] = stream;
            }
        });
    }

    private finalize(stream: any) {
        if (!this.saveStream) {
            stream.end();
        }
    }
}