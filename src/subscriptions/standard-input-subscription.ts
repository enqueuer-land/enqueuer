import {Subscription} from './subscription';
import {SubscriptionModel} from '../models/inputs/subscription-model';
import {Injectable} from 'conditional-injector';

process.stdin.setEncoding('utf8');
process.stdin.resume();

@Injectable({predicate: (subscriptionAttributes: any) => subscriptionAttributes.type === 'standard-input'})
export class StandardInputSubscription extends Subscription {

    constructor(subscriptionModel: SubscriptionModel) {
        super(subscriptionModel);
    }

    public receiveMessage(): Promise<string> {
        return new Promise((resolve) => {
            let requisition: string = '';
            process.stdin.on('data', (chunk) => requisition += chunk);
            process.stdin.on('end', () => resolve(requisition));
        });
    }

    public connect(): Promise<void> {
        return Promise.resolve();
    }

    public unsubscribe(): void {
        process.stdin.pause();
    }

}