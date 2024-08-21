import { TaskModel } from '../models/inputs/task-model';
import { TaskAdopter } from '../components/task-adopter';
import { TaskValidator } from './task-validator';
import { Logger } from '../loggers/logger';
import { SensorModel } from '../models/inputs/sensor-model';
import { ActuatorModel } from '../models/inputs/actuator-model';

export class ComponentImporter {
  public importTask(task: TaskModel): TaskModel {
    const importValue = task.import;
    if (importValue) {
      const imported: any = Array.isArray(importValue) ? { tasks: importValue } : importValue;
      const taskValidator = new TaskValidator();
      if (!taskValidator.validate(imported)) {
        const message = `Error importing ${JSON.stringify(importValue)}: ${taskValidator.getErrorMessage()}`;
        Logger.error(message);
        throw message;
      }
      const merged = Object.assign({}, task, imported);
      return new TaskAdopter(merged).getTask();
    }
    return task;
  }

  public importSensor(sensor: SensorModel): SensorModel {
    const importValue = sensor.import;
    if (importValue) {
      return Object.assign({}, sensor, importValue);
    }
    return sensor;
  }

  public importActuator(actuatorModel: ActuatorModel): ActuatorModel {
    const importValue = actuatorModel.import;
    if (importValue) {
      return Object.assign({}, actuatorModel, importValue);
    }
    return actuatorModel;
  }
}
