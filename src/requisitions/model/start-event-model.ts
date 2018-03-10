import {SubscriptionModel} from "./subscription-model";
import {PublisherModel} from "./publisher-model";

export type StartEventModel = {
    subscription?: SubscriptionModel;
    publisher?: PublisherModel;
}