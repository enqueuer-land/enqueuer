import {Event} from '../../events/event';

export interface PublisherModel {
    type: string;
    onMessageReceived?: Event;
    onInit?: Event;
    name: string;

    [propName: string]: any;
}