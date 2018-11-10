import { ReportModel } from './report-model';

export interface SubscriptionModel extends ReportModel {
    id?: string;
    type: string;
    messageReceived?: any;
    connectionTime?: Date | string;
    messageReceivedTime?: Date | string;
}
