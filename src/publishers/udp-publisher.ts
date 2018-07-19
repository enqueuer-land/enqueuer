import {Publisher} from './publisher';
import {PublisherModel} from '../models/inputs/publisher-model';
import {Injectable} from 'conditional-injector';
import {Logger} from '../loggers/logger';
import * as dgram from 'dgram';

@Injectable({predicate: (publishRequisition: any) => publishRequisition.type === 'udp'})
export class UdpPublisher extends Publisher {

    private serverAddress: string;
    private port: number;

    constructor(publisherAttributes: PublisherModel) {
        super(publisherAttributes);
        this.serverAddress = publisherAttributes.serverAddress;
        this.port = publisherAttributes.port;
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

                Logger.debug('Udp message published');
                client.on('error', (data: any) => {
                    reject(data);
                });

                client.on('end', () => {
                    resolve();
                });

                client.on('message', (msg: Buffer) => {
                    this.messageReceived = msg.toString();
                    resolve();
                });

            });
        });
    }
}