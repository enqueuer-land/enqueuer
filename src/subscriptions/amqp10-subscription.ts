import {Subscription} from './subscription';
import {Injectable} from 'conditional-injector';
import {SubscriptionModel} from '../models/inputs/subscription-model';
import {Protocol} from '../protocols/protocol';

const container = require('rhea');

const protocol = new Protocol('amqp1')
    .addAlternativeName('amqp-1')
    .setLibrary('rhea')
    .registerAsSubscription();

@Injectable({predicate: (subscription: any) => protocol.matches(subscription.type)})
export class Amqp10Subscription extends Subscription {

    constructor(subscriptionAttributes: SubscriptionModel) {
        super(subscriptionAttributes);
    }

    public receiveMessage(): Promise<any> {
        return new Promise((resolve, reject) => {
            container.once('message', (context: any) => {
                resolve(context.message);
                context.connection.close();
            });
            container.once('error', reject);
        });
    }

    public subscribe(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.server === true) {
                const server = container.listen(this.connection);
                server.once('listening', resolve);
                server.once('connection', server.close);
                server.once('error', (err: any) => reject(err.error));
            } else {
                container.connect(this.connection);
            }
            this.registerFailures(reject);
            container.once('connection_open', (context: any) => {
                context.connection.open_receiver(this.options);
                resolve();
            });
        });
    }

    private registerFailures(reject: any) {
        container.once('connection_close', (err: any) => reject(err.error));
        container.once('connection_error', (err: any) => reject(err.error));
        container.once('error', (err: any) => reject(err.error));
        container.once('receiver_close', (err: any) => reject(err.error));
    }
}
