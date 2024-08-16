import * as output from '../../models/outputs/requisition-model';
import { DateController } from '../../timers/date-controller';
import { TestModel } from '../../models/outputs/test-model';
import { DefaultHookEvents } from '../../models/events/event';

export class RequisitionDefaultReports {
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
  ): output.RequisitionModel {
    const valid = onFinishTests.every(test => test.valid);
    return {
      valid: valid,
      name: base.name,
      id: base.id,
      ignored: base.ignored,
      level: base.level,
      subscriptions: [],
      publishers: [],
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
      requisitions: []
    };
  }

  public static createRunningError(base: { name: string; id: string }, err: any): output.RequisitionModel {
    return RequisitionDefaultReports.createDefaultReport(base, [
      {
        valid: false,
        name: 'Requisition ran',
        description: err
      }
    ]);
  }

  public static createSkippedReport(base: { name: string; id: string }): output.RequisitionModel {
    return RequisitionDefaultReports.createDefaultReport(base, [
      {
        valid: true,
        name: 'Requisition skipped',
        description: 'There is no iterations set to this requisition'
      }
    ]);
  }

  public static createIgnoredReport(base: { name: string; id: string; ignored?: true }): output.RequisitionModel {
    base.ignored = true;
    return RequisitionDefaultReports.createDefaultReport(base);
  }

  public static createIteratorReport(base: { name: string; id: string }): output.RequisitionModel {
    return RequisitionDefaultReports.createDefaultReport(base);
  }
}
