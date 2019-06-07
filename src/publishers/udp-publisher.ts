import {Publisher} from './publisher';
import {PublisherModel} from '../models/inputs/publisher-model';
import {Logger} from '../loggers/logger';
import * as dgram from 'dgram';
import {PublisherProtocol} from '../protocols/publisher-protocol';
import {MainInstance} from '../plugins/main-instance';

class UdpPublisher extends Publisher {
    constructor(publisherAttributes: PublisherModel) {
        super(publisherAttributes);
    }

    public publish(): Promise<any> {
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

export function entryPoint(mainInstance: MainInstance): void {
    const protocol = new PublisherProtocol('udp',
        (publisherModel: PublisherModel) => new UdpPublisher(publisherModel))
        .addAlternativeName('udp-client');

    mainInstance.protocolManager.addProtocol(protocol);
}
