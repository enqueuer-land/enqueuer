import {Injectable} from 'conditional-injector';
import {DaemonInputAdapter} from './daemon-input-adapter';
import {SubscriptionModel} from '../../models/inputs/subscription-model';
import {Logger} from '../../loggers/logger';

@Injectable()
export class NullDaemonInputAdapter extends DaemonInputAdapter {
    private subscription: SubscriptionModel;

    public constructor(subscription: SubscriptionModel) {
        super();
        this.subscription = subscription;
    }

    public adapt(message: any): string | undefined {
        Logger.warning(`Adapter is not being able to adapt daemon-input of ${JSON.stringify(this.subscription)}`);
        return undefined;
    }
}