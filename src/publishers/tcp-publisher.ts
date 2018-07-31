import {Publisher} from './publisher';
import {PublisherModel} from '../models/inputs/publisher-model';
import * as net from 'net';
import {Injectable} from 'conditional-injector';
import {Logger} from '../loggers/logger';
import {VariablesController} from '../variables/variables-controller';

@Injectable({predicate: (publishRequisition: any) => publishRequisition.type === 'tcp'})
export class TcpPublisher extends Publisher {

    private serverAddress: string;
    private port: number;
    private persistStreamName: string;
    private loadStreamName: string;
    private loadStream: any;

    constructor(publisherAttributes: PublisherModel) {
        super(publisherAttributes);
        this.serverAddress = publisherAttributes.serverAddress;
        this.port = publisherAttributes.port;
        this.persistStreamName = publisherAttributes.persistStreamName;
        this.loadStreamName = publisherAttributes.loadStreamName;
        if (publisherAttributes.loadStreamName) {
            Logger.debug(`Loading tcp client: ${this.loadStreamName}`);
            this.loadStream = VariablesController.sessionVariables()[publisherAttributes.loadStreamName];
        }
    }

    public publish(): Promise<void> {
        return new Promise((resolve, reject) => {

            if (this.loadStreamName) {
                if (!this.loadStream) {
                    return new Error(`There is no tcp stream able to be loaded named ${this.loadStreamName}`);
                }
                this.publishData(this.loadStream, resolve, reject);
            } else {
                const stream = new net.Socket();
                Logger.debug('Tcp stream trying to connect');
                stream.connect(this.port, this.serverAddress, () => {
                    Logger.debug(`Tcp client connected to: ${this.serverAddress}:${this.port}`);
                    this.publishData(stream, resolve, reject);
                });
            }

        });
    }

    private publishData(stream: any, resolve: (value?: (PromiseLike<any> | any)) => void, reject: (reason?: any) => void) {
        stream.once('error', (data: any) => {
            reject(data);
        })
        .once('end', () => {
            resolve();
        })
        .once('data', (msg: Buffer) => {
            this.messageReceived = msg.toString();
            resolve();
        });
        stream.write(this.payload, () => {
            if (this.persistStreamName) {
                Logger.debug(`Persisting publisher stream ${this.persistStreamName}`);
                VariablesController.sessionVariables()[this.persistStreamName] = stream;
            }
        });
    }
}