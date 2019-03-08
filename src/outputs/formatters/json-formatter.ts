import {ReportFormatter} from './report-formatter';
import {RequisitionModel} from '../../models/outputs/requisition-model';
import {Json} from '../../object-notations/json';
import {MainInstance} from '../../plugins/main-instance';

export class JsonReportFormatter implements ReportFormatter {
    public format(report: RequisitionModel): string {
        return new Json().stringify(report);
    }
}

export function entryPoint(mainInstance: MainInstance): void {
    mainInstance.reportFormatterManager.addReportFormatter(() => new JsonReportFormatter(), 'json');
}
