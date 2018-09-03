import {SubscriptionModel} from './subscription-model';
import {StartEventModel} from './start-event-model';
import {Event} from '../../events/event';

export interface RequisitionModel {
    timeout?: number;
    id?: string;
    onInit?: Event;
    name: string;
    subscriptions: SubscriptionModel[];
    startEvent: StartEventModel;
    delay?: number;
    iterations?: number;
    requisitions?: RequisitionModel[];
}