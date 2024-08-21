import { Actuator } from './actuator';
import { ActuatorModel } from '../models/inputs/actuator-model';

export class NullActuator extends Actuator {
  public constructor(actuatorModel: ActuatorModel) {
    super(actuatorModel);
  }

  public act(): Promise<void> {
    return Promise.reject(`Undefined actuator: '${this.type}'`);
  }
}
