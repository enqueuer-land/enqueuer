import { SensorModel } from './sensor-model';
import { Finishable } from '../events/finishable';
import { Initializable } from '../events/initializable';
import { ActuatorModel } from './actuator-model';

export interface TaskModel extends Finishable, Initializable {
  timeout: number;
  id: string;
  name: string;
  level: number;
  sensors: SensorModel[];
  actuators: ActuatorModel[];
  parent?: TaskModel;
  delay: number;
  iterations: number;
  ignore?: boolean;
  import?: TaskModel;
  tasks: TaskModel[];

  [propName: string]: any;
}
