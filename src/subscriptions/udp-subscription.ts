import {Subscription} from './subscription';
import {SubscriptionModel} from '../models/inputs/subscription-model';
import * as dgram from 'dgram';
import {Logger} from '../loggers/logger';
import {Json} from '../object-notations/json';
import {MainInstance} from '../plugins/main-instance';
import {SubscriptionProtocol} from '../protocols/subscription-protocol';

class UdpSubscription extends Subscription {
    private server: any;

    constructor(subscriptionAttributes: SubscriptionModel) {
        super(subscriptionAttributes);

        if (typeof subscriptionAttributes.response != 'string') {
            this.response = new Json().stringify(subscriptionAttributes.response);
        }
    }

    public receiveMessage(): Promise<any> {
        return new Promise((resolve, reject) => {
                this.server.on('error', (err: any) => {
                    this.server.close();
                    reject(err);
                });

                this.server.on('message', (msg: Buffer, remoteInfo: any) => {
                    this.server.close();
                    resolve({payload: msg, remoteInfo: remoteInfo});
                });
            }
        );
    }

    public subscribe(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.server = dgram.createSocket('udp4');
            try {
                this.server.bind(this.port);
                resolve();
            } catch (err) {
                const message = `Udp server could not listen to ${this.port}`;
                Logger.error(message);
                reject(message);
            }
        });
    }

}

export function entryPoint(mainInstance: MainInstance): void {
    const protocol = new SubscriptionProtocol('udp',
        (subscriptionModel: SubscriptionModel) => new UdpSubscription(subscriptionModel),
        ['payload', 'remoteInfo'])
        .addAlternativeName('udp-server');

    mainInstance.protocolManager.addProtocol(protocol);
}
