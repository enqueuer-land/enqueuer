import {Event} from '../../testers/event';

export interface SubscriptionModel {
    type: string;
    name: string;
    onMessageReceived?: Event;
    onInit?: Event;
    response?: any;
    timeout?: number;

    [propName: string]: any;
}