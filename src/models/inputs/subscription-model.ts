import {Finishable} from '../events/finishable';
import {Initializable} from '../events/initializable';
import {MessageReceiver} from '../events/message-receiver';

export interface SubscriptionModel extends Finishable, Initializable, MessageReceiver {
    type: string;
    name: string;
    response?: any;
    avoid?: boolean;
    timeout?: number;

    [propName: string]: any;
}