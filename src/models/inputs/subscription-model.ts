import {Event} from '../../events/event';

export interface SubscriptionModel {
    type: string;
    name: string;
    onMessageReceived?: Event;
    onInit?: Event;
    response?: any;
    avoid?: boolean;
    timeout?: number;

    [propName: string]: any;
}