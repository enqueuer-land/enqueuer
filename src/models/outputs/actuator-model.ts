import { ReportModel } from './report-model';

export interface ActuatorModel extends ReportModel {
  id: string;
  type: string;
  messageReceived?: any;
  messageSentInstant?: Date | string;
}
