import {Publisher} from './publisher';
import {PublisherModel} from '../models/inputs/publisher-model';
import {Injectable} from 'conditional-injector';
import {Logger} from '../loggers/logger';
import * as dgram from 'dgram';
import {Protocol} from '../protocols/protocol';

const protocol = new Protocol('udp')
    .addAlternativeName('udp-client')
    .registerAsPublisher();

@Injectable({predicate: (publish: any) => protocol.matches(publish.type)})
export class UdpPublisher extends Publisher {

    constructor(publisherAttributes: PublisherModel) {
        super(publisherAttributes);
    }

    public publish(): Promise<void> {
        return new Promise((resolve, reject) => {
            const client = dgram.createSocket('udp4');
            Logger.debug('Udp client trying to send message');

            client.send(Buffer.from(this.payload), this.port, this.serverAddress, (error: any) => {
                if (error) {
                    client.close();
                    reject(error);
                    return;
                }
                Logger.debug('Udp client sent message');
                resolve();
            });

        });
    }
}