import { Subscription } from './subscription';
import { SubscriptionModel } from '../models/inputs/subscription-model';
import * as dgram from 'dgram';
import { Logger } from '../loggers/logger';
import { MainInstance } from '../plugins/main-instance';
import { SubscriptionProtocol } from '../protocols/subscription-protocol';

class UdpSubscription extends Subscription {
    private server: any;

    constructor(subscriptionAttributes: SubscriptionModel) {
        super(subscriptionAttributes);

        if (typeof subscriptionAttributes.response != 'string') {
            this.response = JSON.stringify(subscriptionAttributes.response, null, 2);
        }
    }

    public receiveMessage(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.server.on('error', (err: any) => {
                this.server.close();
                reject(err);
            });

            this.server.on('message', (msg: Buffer, remoteInfo: any) => {
                this.server.close();
                this.executeHookEvent('onMessageReceived', {
                    payload: msg,
                    remoteInfo: remoteInfo
                });
                resolve();
            });
        });
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
    const protocol = new SubscriptionProtocol(
        'udp',
        (subscriptionModel: SubscriptionModel) => new UdpSubscription(subscriptionModel),
        {
            description: 'The udp subscription provides an implementation of UDP Datagram sockets servers',
            libraryHomepage: 'https://nodejs.org/api/dgram.html',
            schema: {
                attributes: {
                    port: {
                        required: true,
                        type: 'int'
                    },
                    response: {
                        required: true,
                        type: 'string'
                    }
                },
                hooks: {
                    onMessageReceived: {
                        arguments: {
                            payload: {},
                            remoteInfo: {
                                description: 'Remote address information'
                            }
                        }
                    }
                }
            }
        }
    ).addAlternativeName('udp-server');

    mainInstance.protocolManager.addProtocol(protocol);
}
