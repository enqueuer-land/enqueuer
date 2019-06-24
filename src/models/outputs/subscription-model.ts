import {ReportModel} from './report-model';

export interface SubscriptionModel extends ReportModel {
    id: string;
    type: string;
    messageReceived?: any;
    subscriptionTime?: Date | string;
    messageReceivedTime?: Date | string;
}
