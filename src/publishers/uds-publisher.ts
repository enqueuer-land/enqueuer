import {Publisher} from './publisher';
import {PublisherModel} from '../models/inputs/publisher-model';
import * as net from 'net';
import {Injectable} from 'conditional-injector';

@Injectable({predicate: (publishRequisition: any) => publishRequisition.type === 'uds'})
export class UdsPublisher extends Publisher {

    private path: string;

    constructor(publisherAttributes: PublisherModel) {
        super(publisherAttributes);
        this.path = publisherAttributes.path;
    }

    publish(): Promise<void> {
        return new Promise((resolve, reject) => {
            const client = net.createConnection(this.path)
                .on('connect', () => {
                    client.write(this.payload);
                    resolve();
                })
                .on('error', function(data: any) {
                    reject(data);
                });
        });
    }
}