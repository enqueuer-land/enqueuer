import {Event} from '../../testers/event';

export interface PublisherModel {
    type: string;
    onMessageReceived?: Event;
    onInit?: Event;
    name: string;

    [propName: string]: any;
}