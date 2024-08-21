import { DateController } from '../timers/date-controller';
import * as input from '../models/inputs/task-model';
import * as output from '../models/outputs/task-model';
import { TaskModel } from '../models/outputs/task-model';
import { SensorModel } from '../models/outputs/sensor-model';
import { ActuatorModel } from '../models/outputs/actuator-model';
import { TaskDefaultReports } from '../models-defaults/outputs/task-default-reports';
import { DefaultHookEvents } from '../models/events/event';
import { HookModel } from '../models/outputs/hook-model';
import { HookReporter } from './hook-reporter';

export class TaskReportGenerator {
  private startTime: DateController = new DateController();
  private readonly timeout?: number;
  private readonly report: output.TaskModel;

  public constructor(taskAttributes: input.TaskModel, timeout?: number) {
    this.report = TaskDefaultReports.createDefaultReport(taskAttributes);
    this.report.id = taskAttributes.id;
    this.startTime = new DateController();
    this.timeout = timeout;
  }

  public setActuatorsReport(actuatorsReport: ActuatorModel[]): void {
    this.report.actuators = actuatorsReport;
  }

  public setSensorsReport(sensorReport: SensorModel[]): void {
    this.report.sensors = sensorReport;
  }

  public getReport(): TaskModel {
    this.report.valid =
      (this.report.sensors || []).every(report => report.valid) &&
      (this.report.actuators || []).every(report => report.valid) &&
      Object.keys(this.report.hooks || {}).every((key: string) =>
        this.report.hooks ? this.report.hooks[key].valid : true
      );
    return this.report;
  }

  public finish(): void {
    this.addTimesReport();
  }

  public addTest(hookName: string, hook: HookModel) {
    this.report.hooks![hookName] = new HookReporter(this.report.hooks![hookName]).addValues(hook);
  }

  private addTimesReport(): void {
    this.report.time = this.generateTimesReport();
    if (this.timeout) {
      this.report.time.timeout = this.timeout;
      if (this.report.time.totalTime > this.report.time.timeout) {
        this.addTest(DefaultHookEvents.ON_FINISH, {
          valid: false,
          tests: [
            {
              valid: false,
              implicit: true,
              name: 'No time out',
              description: `Task has timed out: ${this.report.time.totalTime} > ${this.timeout}`
            }
          ]
        });
      }
    }
  }

  private generateTimesReport() {
    const endDate = new DateController();
    return {
      startTime: this.startTime.toString(),
      endTime: endDate.toString(),
      totalTime: endDate.getTime() - this.startTime.getTime()
    };
  }
}
