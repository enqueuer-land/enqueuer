import {SubscriptionModel} from "./Subscription-model";
import {StartEventModel} from "./start-event-model";

export interface RequisitionModel {
    id: string;
    timeout?: number;
    requisitionVersion: string;
    subscriptions: SubscriptionModel[],
    startEvent: StartEventModel
}