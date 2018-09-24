import {Publisher} from './publisher';
import {PublisherModel} from '../models/inputs/publisher-model';
import * as net from 'net';
import {Injectable} from 'conditional-injector';
import {Store} from '../configurations/store';
import {Logger} from '../loggers/logger';
import {JavascriptObjectNotation} from '../object-notations/javascript-object-notation';

@Injectable({predicate: (publishRequisition: any) => publishRequisition.type === 'uds' || publishRequisition.type === 'uds-client'})
export class UdsPublisher extends Publisher {

    private path: string;
    private saveStream: any;
    private loadStream: string;
    private stream: any;
    private timeout: number;

    constructor(publisherAttributes: PublisherModel) {
        super(publisherAttributes);
        this.path = publisherAttributes.path;
        this.loadStream = publisherAttributes.loadStream;
        this.timeout = publisherAttributes.timeout || 1000;
        this.saveStream = publisherAttributes.saveStream;
    }

    public publish(): Promise<void> {
        const payload = this.stringifyPayload();
        return new Promise((resolve, reject) => {
            this.stream = this.getStream(reject);
            this.stream.setTimeout(1000);
            this.stream.write(payload, () => {
                Logger.trace(`Uds publisher message sent: ${payload}`);
                this.registerEvents(resolve, reject);
            });
        });
    }

    private registerEvents(resolve: any, reject: any) {
        this.stream.setTimeout(this.timeout);
        this.stream.on('timeout', () => {
            Logger.trace(`Uds publisher detected timeout`);
            this.persistStream();
            resolve();
        })
        .once('error', (data: any) => reject(data))
        .once('end', () => {
            Logger.trace(`Uds publisher detected stream end`);
            this.persistStream();
            resolve();
        })
        .once('data', (msg: Buffer) => {
            Logger.trace(`Uds publisher got message: ${msg}`);
            if (!this.messageReceived) {
                this.messageReceived = {
                    payload: ''
                };
            }
            this.messageReceived.payload += msg;
            resolve();
            this.persistStream();
        });
    }

    private stringifyPayload() {
        if (typeof(this.payload) != 'string' && !Buffer.isBuffer(this.payload)) {
            return new JavascriptObjectNotation().stringify(this.payload);
        }
        return this.payload;
    }

    private getStream(reject: any) {
        if (this.loadStream) {
            const storedStream = Store.getData()[this.loadStream];
            if (!storedStream) {
                reject(`There is no uds stream able to be loaded named ${this.loadStream}`);
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
                Logger.debug(`Uds publisher stream '${this.saveStream}' saved`);
            } else {
                Logger.debug(`Uds publisher stream closed`);
                this.stream.end();
            }
        }
        this.stream = null;
    }

}