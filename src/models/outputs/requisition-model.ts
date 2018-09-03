import {ReportModel} from './report-model';
import {TimeModel} from './time-model';
import {SubscriptionModel} from './subscription-model';
import {StartEventModel} from './start-event-model';

export interface RequisitionModel extends ReportModel {
    id?: string;
    time?: TimeModel;
    startEvent: StartEventModel;
    subscriptions?: SubscriptionModel[];
    requisitions?: RequisitionModel[];
}
