import {RequisitionModel} from '../../models/outputs/requisition-model';

export abstract class Formatter {
    abstract format(report: RequisitionModel): string;
}
