import {Subscription} from './subscription';
import {Injectable} from 'conditional-injector';
import {SubscriptionModel} from '../models/inputs/subscription-model';
import {Logger} from '../loggers/logger';
const container = require('rhea');
import {StringRandomCreator} from '../strings/string-random-creator';
import {Protocol} from '../protocols/protocol';

const protocol = new Protocol('amqp10')
    .setLibrary('rhea')
    .registerAsSubscription();

@Injectable({predicate: (subscription: any) => protocol.matches(subscription.type)})
export class Amqp10Subscription extends Subscription {

    constructor(subscriptionAttributes: SubscriptionModel) {
        super(subscriptionAttributes);
        this.queueName = subscriptionAttributes.queueName || new StringRandomCreator().create(8);
    }

    public receiveMessage(): Promise<any> {
        return new Promise((resolve) => {
            container.on('message', (context: any) => {
                resolve(context.message);
                context.connection.close();
            });
        });
    }

    public subscribe(): Promise<void> {
        return new Promise((resolve) => {
            container.on('connection_open', (context: any) => {
                context.connection.open_receiver(this.routingKey);
                resolve();
            });
            container.connect(this.options);
        });
    }

}
