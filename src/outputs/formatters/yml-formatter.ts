import { ReportFormatter } from './report-formatter';
import { TaskModel } from '../../models/outputs/task-model';
import { MainInstance } from '../../plugins/main-instance';
import { YmlObjectParser } from '../../object-parser/yml-object-parser';

export class YmlReportFormatter implements ReportFormatter {
  public format(report: TaskModel): string {
    return new YmlObjectParser().stringify(report);
  }
}

export function entryPoint(mainInstance: MainInstance): void {
  mainInstance.reportFormatterManager.addReportFormatter(() => new YmlReportFormatter(), 'yml', 'yaml');
}
