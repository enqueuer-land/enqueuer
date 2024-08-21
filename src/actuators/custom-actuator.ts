import { Actuator } from './actuator';
import { Store } from '../configurations/store';
import { Logger } from '../loggers/logger';
import { ActuatorModel } from '../models/inputs/actuator-model';
import * as fs from 'fs';
import requireFromString from 'require-from-string';
import { MainInstance } from '../plugins/main-instance';
import { ActuatorProtocol } from '../protocols/actuator-protocol';

class CustomActuator extends Actuator {
  constructor(model: ActuatorModel) {
    super(model);
    this['model'] = model;
  }

  public async act(): Promise<void> {
    try {
      const moduleString: string = fs.readFileSync(this.module).toString();
      const module = requireFromString(moduleString);
      const custom = new module.Actuator(this);
      return await custom.act({ store: Store.getData(), logger: Logger });
    } catch (err) {
      Logger.error(`Error loading module '${this.module}': ${err}`);
    }
  }
}

export function entryPoint(mainInstance: MainInstance): void {
  const protocol = new ActuatorProtocol('custom', (actuatorModel: ActuatorModel) => new CustomActuator(actuatorModel));

  mainInstance.protocolManager.addProtocol(protocol);
}
