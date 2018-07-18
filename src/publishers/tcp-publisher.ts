import {Publisher} from './publisher';
import {PublisherModel} from '../models/inputs/publisher-model';
import * as net from 'net';
import {Injectable} from 'conditional-injector';
import {Logger} from "../loggers/logger";

@Injectable({predicate: (publishRequisition: any) => publishRequisition.type === 'tcp'})
export class TcpPublisher extends Publisher {

    private serverAddress: string;
    private port: number;

    constructor(publisherAttributes: PublisherModel) {
        super(publisherAttributes);
        this.serverAddress = publisherAttributes.serverAddress;
        this.port = publisherAttributes.port;
    }

    public publish(): Promise<void> {
        return new Promise((resolve, reject) => {
            const client = new net.Socket();

            Logger.debug('Tcp client trying to connect');
            client.connect(this.port, this.serverAddress, () => {

                Logger.debug(`Tcp client connected to: ${this.serverAddress}:${this.port}`);
                client.write(this.payload);
                client.on('error', (data: any) => {
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

        });
    }
}