import {ReportFormatter} from './report-formatter';
import {RequisitionModel} from '../../models/outputs/requisition-model';
import {MainInstance} from '../../plugins/main-instance';

export class JsonReportFormatter implements ReportFormatter {
    public format(report: RequisitionModel): string {
        return JSON.stringify(report, null, 2);
    }
}

export function entryPoint(mainInstance: MainInstance): void {
    mainInstance.reportFormatterManager.addReportFormatter(() => new JsonReportFormatter(), 'json');
}
