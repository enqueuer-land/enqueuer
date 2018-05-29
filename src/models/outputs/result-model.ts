import { RequisitionModel } from './requisition-model';
import { ReportModel } from './report-model';

export interface ResultModel extends ReportModel {
    id?: string;
    type: 'runnable';
    runnables: (ResultModel | RequisitionModel)[];
}