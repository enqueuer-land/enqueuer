import { Sensor } from './sensor';
import { SensorModel } from '../models/inputs/sensor-model';
import { Store } from '../configurations/store';
import { Logger } from '../loggers/logger';
import * as fs from 'fs';
import requireFromString from 'require-from-string';
import { MainInstance } from '../plugins/main-instance';
import { SensorProtocol } from '../protocols/sensor-protocol';

class CustomSensor extends Sensor {
  constructor(sensorModel: SensorModel) {
    super(sensorModel);
    try {
      const moduleString: string = fs.readFileSync(this.module).toString();
      const module = requireFromString(moduleString);
      this.custom = new module.Sensor(this);
    } catch (err) {
      Logger.error(`Error loading module '${this.module}': ${err}`);
    }
  }

  public async prepare(): Promise<void> {
    return this.custom.prepare({ store: Store.getData(), logger: Logger });
  }

  public async receiveMessage(): Promise<void> {
    return this.custom.receiveMessage({
      store: Store.getData(),
      logger: Logger
    });
  }

  public async unprepare(): Promise<any> {
    if (this.custom.close) {
      return this.custom.unprepare({
        store: Store.getData(),
        logger: Logger
      });
    }
  }

  public async respond(): Promise<any> {
    if (this.custom.respond) {
      return this.custom.respond({
        store: Store.getData(),
        logger: Logger
      });
    }
  }
}

export function entryPoint(mainInstance: MainInstance): void {
  const protocol = new SensorProtocol('custom', (sensorModel: SensorModel) => new CustomSensor(sensorModel));
  mainInstance.protocolManager.addProtocol(protocol);
}
