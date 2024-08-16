import { ReportFormatter } from './report-formatter';
import { RequisitionModel } from '../../models/outputs/requisition-model';
import { MainInstance } from '../../plugins/main-instance';
import { YmlObjectParser } from '../../object-parser/yml-object-parser';

export class YmlReportFormatter implements ReportFormatter {
    public format(report: RequisitionModel): string {
        return new YmlObjectParser().stringify(report);
    }
}

export function entryPoint(mainInstance: MainInstance): void {
    mainInstance.reportFormatterManager.addReportFormatter(() => new YmlReportFormatter(), 'yml', 'yaml');
}
