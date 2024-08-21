import { ActuatorReporter } from './actuator-reporter';
import * as output from '../../models/outputs/actuator-model';
import * as input from '../../models/inputs/actuator-model';
import { Logger } from '../../loggers/logger';
import { ComponentImporter } from '../../task-runners/component-importer';

export class MultiActuatorsReporter {
  private actuators: ActuatorReporter[];

  constructor(actuators: input.ActuatorModel[]) {
    Logger.debug(`Instantiating actuators`);
    this.actuators = actuators.map(actuator => new ActuatorReporter(new ComponentImporter().importActuator(actuator)));
  }

  public async act(): Promise<void> {
    if (this.actuators.length > 0) {
      Logger.debug(`Actuators are acting`);

      await Promise.all(
        this.actuators.map(async actuator => {
          try {
            await actuator.act();
          } catch (err) {
            Logger.error(`Actuators errored: ` + err);
          }
        })
      );
      Logger.debug(`Actuators have acted`);
    }
  }

  public onFinish(): void {
    //sync forEach
    this.actuators.map(actuator => actuator.onFinish());
  }

  public getReport(): output.ActuatorModel[] {
    return this.actuators.map(actuator => actuator.getReport());
  }
}
