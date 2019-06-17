import {Assertion} from './assertion';

export enum DefaultHookEvents {
    ON_INIT = 'onInit',
    ON_MESSAGE_RECEIVED = 'onMessageReceived',
    ON_FINISH = 'onFinish',
}

export interface Event {
    script?: string;
    assertions?: Assertion[];
    store?: {[propName: string]: any; };
}
