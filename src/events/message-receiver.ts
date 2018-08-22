import {Event} from './event';
import {EventOwner} from './event-owner';

export interface MessageReceiver extends EventOwner {
    messageReceived?: any;
    onMessageReceived?: Event;
}