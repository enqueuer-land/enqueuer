import {Publisher} from './publisher';
import {PublisherModel} from '../models/inputs/publisher-model';
import {Injectable} from 'conditional-injector';
import {Logger} from '../loggers/logger';
import * as dgram from 'dgram';
import {ProtocolManager} from '../protocols/protocol-manager';

const protocol = ProtocolManager.getInstance()
    .insertPublisherProtocol('udp', ['udp-client']);

@Injectable({predicate: (publish: any) => protocol
        .matchesRatingAtLeast(publish.type, 95)})
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