import { TimeModel } from './time-model';
import { SubscriptionModel } from './subscription-model';
import { PublisherModel } from './publisher-model';
import { ReportModel } from './report-model';

export interface RequisitionModel extends ReportModel {
    id: string;
    time: TimeModel;
    publishers: PublisherModel[];
    subscriptions: SubscriptionModel[];
    requisitions: RequisitionModel[];
    level?: number;
    iteration?: number;
    totalIterations?: number;
}
