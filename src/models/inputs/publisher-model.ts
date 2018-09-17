import {Finishable} from '../events/finishable';
import {Initializable} from '../events/initializable';
import {MessageReceiver} from '../events/message-receiver';

export interface PublisherModel extends Finishable, Initializable, MessageReceiver {
    type: string;
    name: string;

    [propName: string]: any;
}