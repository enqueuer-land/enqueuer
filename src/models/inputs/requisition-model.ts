import {SubscriptionModel} from './subscription-model';
import {StartEventModel} from './start-event-model';
import {Finishable} from '../events/finishable';
import {Initializable} from '../events/initializable';

export interface RequisitionModel extends Finishable, Initializable {
    timeout?: number;
    id?: string;
    name: string;
    subscriptions: SubscriptionModel[];
    startEvent: StartEventModel;
    delay?: number;
    iterations?: number;
    requisitions?: RequisitionModel[];
}