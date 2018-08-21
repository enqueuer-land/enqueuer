import {SubscriptionModel} from './subscription-model';
import {StartEventModel} from './start-event-model';
import {Event} from '../../testers/event';

export interface RequisitionModel {
    timeout?: number;
    onInit?: Event;
    name: string;
    subscriptions: SubscriptionModel[];
    startEvent: StartEventModel;
}