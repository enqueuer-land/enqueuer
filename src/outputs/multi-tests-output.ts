import { Logger } from '../loggers/logger';
import { TaskModel } from '../models/outputs/task-model';
import { ActuatorModel } from '../models/inputs/actuator-model';
import { Actuator } from '../actuators/actuator';
import { ReportFormatter } from './formatters/report-formatter';
import { DynamicModulesManager } from '../plugins/dynamic-modules-manager';

export class MultiTestsOutput {
  private outputs: Actuator[] = [];

  public constructor(outputs: ActuatorModel[]) {
    (outputs || []).forEach((output: ActuatorModel) => {
      Logger.debug(`Instantiating output '${output.type}' and format '${output.format}'`);
      const actuator = DynamicModulesManager.getInstance().getProtocolManager().createActuator(output);
      actuator.formatter = DynamicModulesManager.getInstance()
        .getReportFormatterManager()
        .createReportFormatter(output.format);
      actuator.format = output.format;
      this.outputs.push(actuator);
    });
  }

  public async publishReport(report: TaskModel) {
    await Promise.all(
      this.outputs.map(actuator => {
        try {
          const formatter = actuator.formatter as ReportFormatter;
          Logger.trace(`Formatting as ${actuator.format}`);
          actuator.payload = formatter.format(report);
          return actuator.act();
        } catch (err) {
          Logger.warning(`Error publishing report: ${JSON.stringify(report)}: ${err}`);
        }
      })
    );
  }
}
