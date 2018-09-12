import { ReportModel } from './report-model';

export interface PublisherModel extends ReportModel {
    type: string;
    messageReceived?: any;
    publishTime?: Date | string;
}