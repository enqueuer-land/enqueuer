import {Injectable} from 'conditional-injector';
import {DaemonInputAdapter} from './daemon-input-adapter';
import {SubscriptionModel} from '../../models/inputs/subscription-model';
import {Logger} from '../../loggers/logger';

@Injectable()
export class NullDaemonInputAdapter extends DaemonInputAdapter {
    private subscription: SubscriptionModel;

    public constructor(subscription: SubscriptionModel) {
        super();
        Logger.warning(`Instantiating unknown daemon input adapter from"${JSON.stringify(subscription)}`);
        this.subscription = subscription;
    }

    public adapt(message: any): string {
        const errorMessage = `Adapter is not being able to adapt daemon-input of ${JSON.stringify(this.subscription)}`;
        Logger.warning(errorMessage);
        throw errorMessage;
    }
}