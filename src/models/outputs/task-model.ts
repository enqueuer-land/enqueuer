import { TimeModel } from './time-model';
import { SensorModel } from './sensor-model';
import { ActuatorModel } from './actuator-model';
import { ReportModel } from './report-model';

export interface TaskModel extends ReportModel {
  id: string;
  time: TimeModel;
  actuators: ActuatorModel[];
  sensors: SensorModel[];
  tasks: TaskModel[];
  level?: number;
  iteration?: number;
  totalIterations?: number;
}
