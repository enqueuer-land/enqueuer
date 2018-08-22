import {Event} from './event';
import {EventOwner} from './event-owner';

export interface Initializable extends EventOwner {
    onInit?: Event;
}