import {SubscriptionModel} from './subscription-model';
import {PublisherModel} from './publisher-model';

export interface StartEventModel {
    subscription?: SubscriptionModel;
    publisher?: PublisherModel;
}