import {Publisher} from './publisher';
import {PublisherModel} from '../models/inputs/publisher-model';
import * as net from 'net';
import {Injectable} from 'conditional-injector';
import {Logger} from '../loggers/logger';
import {VariablesController} from '../variables/variables-controller';
import {isNullOrUndefined} from 'util';

@Injectable({predicate: (publishRequisition: any) => publishRequisition.type === 'tcp-client'})
export class TcpClientPublisher extends Publisher {

    private serverAddress: string;
    private port: number;
    private persistStreamName: string;
    private loadStreamName: string;
    private loadStream: any;
    private timeout: number;

    constructor(publisherAttributes: PublisherModel) {
        super(publisherAttributes);
        this.serverAddress = publisherAttributes.serverAddress;
        this.port = publisherAttributes.port;
        this.persistStreamName = publisherAttributes.persistStreamName;
        this.loadStreamName = publisherAttributes.loadStreamName;
        this.timeout = publisherAttributes.timeout || 100;
        if (publisherAttributes.loadStreamName) {
            Logger.debug(`Loading tcp client: ${this.loadStreamName}`);
            this.loadStream = VariablesController.sessionVariables()[publisherAttributes.loadStreamName];
        }
    }

    public publish(): Promise<void> {
        return new Promise((resolve, reject) => {

            if (this.loadStreamName) {
                Logger.debug('Trying to reuse tcp stream');
                if (!this.loadStream) {
                    return new Error(`There is no tcp stream able to be loaded named ${this.loadStreamName}`);
                }
                this.publishData(this.loadStream, resolve, reject);
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
            if (!this.persistStreamName) {
                stream.end();
            }
            stream.removeAllListeners('data');
            resolve(this.messageReceived);
        })
        .once('error', (data: any) => {
            if (!this.persistStreamName) {
                stream.end();
            }
            reject(data);
        })
        .once('end', () => {
            Logger.debug(`Tcp client detected 'end' event`);
            if (!this.persistStreamName) {
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
            if (this.persistStreamName) {
                Logger.debug(`Persisting publisher stream ${this.persistStreamName}`);
                VariablesController.sessionVariables()[this.persistStreamName] = stream;
            }
        });
    }
}