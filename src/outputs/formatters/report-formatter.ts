import {RequisitionModel} from '../../models/outputs/requisition-model';

export abstract class ReportFormatter {
    abstract format(report: RequisitionModel): string;
}
