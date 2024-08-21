import { Actuator } from './actuator';
import { ActuatorModel } from '../models/inputs/actuator-model';
import { MainInstance } from '../plugins/main-instance';
import { ActuatorProtocol } from '../protocols/actuator-protocol';

class StandardOutputActuator extends Actuator {
  public constructor(actuatorProperties: ActuatorModel) {
    super(actuatorProperties);
  }

  public act(): Promise<void> {
    if (typeof this.payload === 'object') {
      this.payload = JSON.stringify(this.payload, null, 2);
    }
    console.log(this.payload);
    return Promise.resolve();
  }
}

export function entryPoint(mainInstance: MainInstance): void {
  const protocol = new ActuatorProtocol(
    'stdout',
    (actuatorModel: ActuatorModel) => new StandardOutputActuator(actuatorModel),
    {
      schema: {
        attributes: {
          payload: {
            type: 'text',
            required: true
          }
        }
      }
    }
  ).addAlternativeName('standard-output');

  mainInstance.protocolManager.addProtocol(protocol);
}
