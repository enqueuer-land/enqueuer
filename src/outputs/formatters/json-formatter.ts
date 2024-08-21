import { ReportFormatter } from './report-formatter';
import { TaskModel } from '../../models/outputs/task-model';
import { MainInstance } from '../../plugins/main-instance';
import { Logger } from '../../loggers/logger';

export class JsonReportFormatter implements ReportFormatter {
  public format(report: TaskModel): string {
    try {
      return JSON.stringify(report, null, 2);
    } catch (err) {
      Logger.warning(`Json formatter errored: ` + err);
      throw err;
    }
  }
}

export function entryPoint(mainInstance: MainInstance): void {
  mainInstance.reportFormatterManager.addReportFormatter(() => new JsonReportFormatter(), 'json');
}
