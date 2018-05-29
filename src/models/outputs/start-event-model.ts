import { PublisherModel } from './publisher-model';
import { SubscriptionModel } from './subscription-model';

export interface StartEventModel {
    publisher?: PublisherModel;
    subscription?: SubscriptionModel;
}