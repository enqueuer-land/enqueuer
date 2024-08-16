import { Subscription } from './subscription';
import { SubscriptionModel } from '../models/inputs/subscription-model';
import { MainInstance } from '../plugins/main-instance';
import { SubscriptionProtocol } from '../protocols/subscription-protocol';

class StandardInputSubscription extends Subscription {
    private value?: string;

    constructor(subscriptionModel: SubscriptionModel) {
        super(subscriptionModel);
    }

    public receiveMessage(): Promise<void> {
        return new Promise(resolve => {
            process.stdin.on('end', () => {
                if (this.value) {
                    resolve();
                    this.executeHookEvent('onMessageReceived', { message: this.value });
                }
            });
        });
    }

    public subscribe(): Promise<void> {
        process.stdin.setEncoding('utf8');
        process.stdin.resume();
        process.stdin.on('data', chunk => {
            if (!this.value) {
                this.value = chunk.toString();
            } else {
                this.value += chunk;
            }
        });
        return Promise.resolve();
    }

    public async unsubscribe(): Promise<void> {
        process.stdin.pause();
    }
}

export function entryPoint(mainInstance: MainInstance): void {
    const protocol = new SubscriptionProtocol(
        'stdin',
        (subscriptionModel: SubscriptionModel) => new StandardInputSubscription(subscriptionModel),
        {
            schema: {
                hooks: {
                    onMessageReceived: {
                        arguments: {
                            message: {}
                        }
                    }
                }
            }
        }
    ).addAlternativeName('standard-input');

    mainInstance.protocolManager.addProtocol(protocol);
}
