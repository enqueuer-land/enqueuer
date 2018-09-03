import {ReportModel} from './report-model';
import {RequisitionModel} from './requisition-model';

export interface SingleRunResultModel extends ReportModel {
    requisitions: RequisitionModel[];
}