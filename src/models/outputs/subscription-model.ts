import { ReportModel } from './report-model';

export interface SubscriptionModel extends ReportModel {
    type: string;
    messageReceived?: any;
    connectionTime?: Date | string;
    messageReceivedTime?: Date | string;
}