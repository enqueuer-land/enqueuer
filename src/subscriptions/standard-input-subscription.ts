import {Subscription} from './subscription';
import {SubscriptionModel} from '../models/inputs/subscription-model';
import {Injectable} from 'conditional-injector';

@Injectable({predicate: (subscriptionAttributes: any) => subscriptionAttributes.type === 'standard-input'})
export class StandardInputSubscription extends Subscription {

    constructor(subscriptionModel: SubscriptionModel) {
        super(subscriptionModel);
    }

    public receiveMessage(): Promise<any> {
        return new Promise((resolve) => {
            let requisition: string = '';
            if (this.isNotTestMode) {
                process.stdin.on('data', (chunk) => requisition += chunk);
                process.stdin.on('end', () => resolve(requisition));
            }
        });
    }

    public subscribe(): Promise<void> {
        if (this.isNotTestMode()) {
            process.stdin.setEncoding('utf8');
            process.stdin.resume();
        }
        return Promise.resolve();
    }

    public unsubscribe(): void {
        process.stdin.pause();
    }

    private isNotTestMode() {
        return !process.argv[1].toString().match('jest');
    }

}