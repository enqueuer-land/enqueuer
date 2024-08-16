import { ReportModel } from './report-model';

export interface PublisherModel extends ReportModel {
    id: string;
    type: string;
    messageReceived?: any;
    publishTime?: Date | string;
}
