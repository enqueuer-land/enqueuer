import * as output from '../../models/outputs/task-model';
import { DateController } from '../../timers/date-controller';
import { TestModel } from '../../models/outputs/test-model';
import { DefaultHookEvents } from '../../models/events/event';

export class TaskDefaultReports {
  public static createDefaultReport(
    base: {
      name: string;
      id: string;
      ignored?: boolean;
      level?: number;
      iteration?: number;
      totalIterations?: number;
    },
    onFinishTests: TestModel[] = []
  ): output.TaskModel {
    const valid = onFinishTests.every(test => test.valid);
    return {
      valid: valid,
      name: base.name,
      id: base.id,
      ignored: base.ignored,
      level: base.level,
      sensors: [],
      actuators: [],
      iteration: base.iteration,
      totalIterations: base.totalIterations,
      hooks: {
        [DefaultHookEvents.ON_INIT]: {
          arguments: {},
          valid: true,
          tests: []
        },
        [DefaultHookEvents.ON_FINISH]: {
          arguments: {},
          valid: valid,
          tests: onFinishTests
        }
      },
      time: {
        startTime: new DateController().toString(),
        endTime: new DateController().toString(),
        totalTime: 0
      },
      tasks: []
    };
  }

  public static createRunningError(base: { name: string; id: string }, err: any): output.TaskModel {
    return TaskDefaultReports.createDefaultReport(base, [
      {
        valid: false,
        name: 'Task ran',
        description: err
      }
    ]);
  }

  public static createSkippedReport(base: { name: string; id: string }): output.TaskModel {
    return TaskDefaultReports.createDefaultReport(base, [
      {
        valid: true,
        name: 'Task skipped',
        description: 'There is no iterations set to this task'
      }
    ]);
  }

  public static createIgnoredReport(base: { name: string; id: string; ignored?: true }): output.TaskModel {
    base.ignored = true;
    return TaskDefaultReports.createDefaultReport(base);
  }

  public static createIteratorReport(base: { name: string; id: string }): output.TaskModel {
    return TaskDefaultReports.createDefaultReport(base);
  }
}
