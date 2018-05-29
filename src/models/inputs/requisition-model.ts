import {SubscriptionModel} from './subscription-model';
import {StartEventModel} from './start-event-model';

export interface RequisitionModel {
    timeout?: number;
    name: string;
    subscriptions: SubscriptionModel[];
    startEvent: StartEventModel;
}