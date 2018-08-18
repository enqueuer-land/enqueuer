import {Publisher} from './publisher';
import {PublisherModel} from '../models/inputs/publisher-model';
import * as net from 'net';
import {Injectable} from 'conditional-injector';
import {Store} from '../testers/store';
import {Logger} from '../loggers/logger';

@Injectable({predicate: (publishRequisition: any) => publishRequisition.type === 'uds'})
export class UdsPublisher extends Publisher {

    private path: string;
    private saveStream: any;
    private loadStream: string;
    private stream: any;

    constructor(publisherAttributes: PublisherModel) {
        super(publisherAttributes);
        if (typeof(this.payload) != 'string' && !Buffer.isBuffer(this.payload)) {
            this.payload = JSON.stringify(this.payload);
        }
        this.path = publisherAttributes.path;
        this.loadStream = publisherAttributes.loadStream;
        this.saveStream = publisherAttributes.saveStream;
    }

    public publish(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.stream = this.getStream();

            this.stream.setTimeout(1000);
            this.stream.on('timeout', () => {
                this.persistStream();
                resolve(this.messageReceived);
            }).once('error', (data: any) => {
                reject(data);
            })
            .once('end', () => {
                Logger.trace(`Uds publisher detected stream end`);
                this.persistStream();
                resolve();
            })
            .once('data', (msg: Buffer) => {
                Logger.debug(`Uds publisher got message`);
                if (this.messageReceived === null || this.messageReceived === undefined) {
                    this.messageReceived = msg;
                } else {
                    this.messageReceived = this.messageReceived.concat(msg);
                }
            });
            this.stream.write(this.payload, () => Logger.trace(`Uds publisher message sent: ${this.payload}`));
        });
    }

    private getStream() {
        if (this.loadStream) {
            const storedStream = Store.getData()[this.loadStream];
            if (!storedStream) {
                throw new Error(`There is no uds stream able to be loaded named ${this.loadStream}`);
            }
            Logger.debug(`Uds publisher is reusing stream: ${this.loadStream}`);
            return storedStream;
        } else {
            return net.createConnection(this.path);
        }
    }

    private persistStream() {
        if (this.stream) {
            this.stream.removeAllListeners('data');
            this.stream.removeAllListeners('connect');
            this.stream.removeAllListeners('error');
            this.stream.removeAllListeners('end');
            if (this.saveStream) {
                Store.getData()[this.saveStream] = this.stream;
                Logger.debug(`Uds publisher saved stream`);
            } else {
                this.stream.end();
            }
        }
        this.stream = null;
    }

}