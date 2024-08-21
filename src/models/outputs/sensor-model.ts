import { ReportModel } from './report-model';

export interface SensorModel extends ReportModel {
  id: string;
  type: string;
  messageReceived?: any;
  sensorTime?: Date | string;
  messageReceivedTime?: Date | string;
}
