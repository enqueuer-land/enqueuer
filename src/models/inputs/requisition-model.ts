import {SubscriptionModel} from './subscription-model';
import {Finishable} from '../events/finishable';
import {Initializable} from '../events/initializable';
import {PublisherModel} from './publisher-model';

export interface RequisitionModel extends Finishable, Initializable {
    timeout?: number;
    id?: string;
    name: string;
    subscriptions: SubscriptionModel[];
    publishers: PublisherModel[];
    delay?: number;
    iterations?: number;
    requisitions?: RequisitionModel[];
}