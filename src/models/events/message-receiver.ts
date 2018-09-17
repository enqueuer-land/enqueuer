import {Event} from './event';

export interface MessageReceiver {
    messageReceived?: any;
    onMessageReceived?: Event;
}