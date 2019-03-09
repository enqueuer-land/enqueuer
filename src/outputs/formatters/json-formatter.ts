import {ReportFormatter} from './report-formatter';
import {RequisitionModel} from '../../models/outputs/requisition-model';
import {MainInstance} from '../../plugins/main-instance';
import {JsonObjectParser} from '../../object-parser/json-object-parser';

export class JsonReportFormatter implements ReportFormatter {
    public format(report: RequisitionModel): string {
        return new JsonObjectParser().stringify(report);
    }
}

export function entryPoint(mainInstance: MainInstance): void {
    mainInstance.reportFormatterManager.addReportFormatter(() => new JsonReportFormatter(), 'json');
}
