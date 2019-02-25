import {RequisitionModel} from '../../models/outputs/requisition-model';

export interface ReportFormatter {
    format(report: RequisitionModel): string;
}
