import {ReportFormatter} from './report-formatter';
import {RequisitionModel} from '../../models/outputs/requisition-model';
import {Yaml} from '../../object-notations/yaml';
import {MainInstance} from '../../plugins/main-instance';

export class YmlReportFormatter extends ReportFormatter {
    public format(report: RequisitionModel): string {
        return new Yaml().stringify(report);
    }
}

export function entryPoint(mainInstance: MainInstance): void {
    mainInstance.reportFormatterManager.addReportFormatter(() => new YmlReportFormatter(), 'yml', 'yaml');
}
