import { ReportFormatter } from './report-formatter';
import { RequisitionModel } from '../../models/outputs/requisition-model';
import { MainInstance } from '../../plugins/main-instance';
import { ObjectDecycler } from '../../object-parser/object-decycler';
import { prettifyJson } from '../prettify-json';

export class ConsoleFormatter implements ReportFormatter {
    public format(report: RequisitionModel): string {
        return prettifyJson(new ObjectDecycler().decycle(report));
    }
}

export function entryPoint(mainInstance: MainInstance): void {
    mainInstance.reportFormatterManager.addReportFormatter(() => new ConsoleFormatter(), 'console', 'stdout');
}
