import { TaskModel } from '../../models/outputs/task-model';

export interface ReportFormatter {
  format(report: TaskModel): string;
}
