import { ReportModel } from './report-model';

export interface PublisherModel extends ReportModel {
    type: string;
    publishTime?: Date | string;
}