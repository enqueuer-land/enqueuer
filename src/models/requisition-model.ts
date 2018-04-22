import {SubscriptionModel} from "./subscription-model";
import {StartEventModel} from "./start-event-model";

export interface RequisitionModel {
    id: string;
    timeout?: number;
    name?: string;
    requisitionVersion: string;
    subscriptions: SubscriptionModel[],
    startEvent: StartEventModel
}