import { ReportModel } from './report-model';

export interface SubscriptionModel extends ReportModel {
    type: string;
    connectionTime?: Date | string;
    messageReceivedTime?: Date | string;
}