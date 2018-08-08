import {Publisher} from './publisher';
import {PublisherModel} from '../models/inputs/publisher-model';
import * as net from 'net';
import {Injectable} from 'conditional-injector';

@Injectable({predicate: (publishRequisition: any) => publishRequisition.type === 'uds'})
export class UdsPublisher extends Publisher {

    private path: string;

    constructor(publisherAttributes: PublisherModel) {
        super(publisherAttributes);
        if (typeof(this.payload) == 'string' || !Buffer.isBuffer(this.payload) || typeof(this.payload) == 'number') {
            this.payload = JSON.stringify(this.payload);
        }
        this.path = publisherAttributes.path;
    }

    public publish(): Promise<void> {
        return new Promise((resolve, reject) => {
            const client = net.createConnection(this.path)
                .on('connect', () => {
                    client.write(this.payload);
                })
                .on('error', (data: any) => {
                    reject(data);
                })
                .on('end', () => {
                    resolve();
                })
                .on('data', (msg: Buffer) => {
                    this.messageReceived = msg.toString();
                    resolve();
                });
        });
    }
}