import { Logger } from './loggers/logger';
import { MultiTestsOutput } from './outputs/multi-tests-output';
import * as input from './models/inputs/task-model';
import * as output from './models/outputs/task-model';
import { DateController } from './timers/date-controller';
import { TaskFilePatternParser } from './task-runners/task-file-pattern-parser';
import { TaskRunner } from './task-runners/task-runner';
import { Configuration } from './configurations/configuration';
import { TaskAdopter } from './components/task-adopter';
import { NotificationEmitter } from './notifications/notification-emitter';
import { SummaryTestOutput } from './outputs/summary-test-output';
import { ActuatorModel } from './models/inputs/actuator-model';
import { TestModel } from './models/outputs/test-model';
import { LogLevel } from './loggers/log-level';
import { Notifications } from './notifications/notifications';

export class EnqueuerRunner {
  private static reportName: string = 'enqueuer';

  private enqueuerTask?: input.TaskModel;

  constructor() {
    NotificationEmitter.on(
      Notifications.REQUISITION_FINISHED,
      async (report: any) => await EnqueuerRunner.printReport(report.task)
    );
  }

  public async execute(): Promise<output.TaskModel[]> {
    const configuration = Configuration.getInstance();
    Logger.setLoggerLevel(LogLevel.INFO);
    Logger.info('Rocking and rolling');
    Logger.setLoggerLevel(LogLevel.buildFromString(configuration.getLogLevel()));
    const taskFileParser = new TaskFilePatternParser(configuration.getFiles());
    const tasks = taskFileParser.parse();
    this.enqueuerTask = new TaskAdopter({
      tasks,
      name: EnqueuerRunner.reportName,
      timeout: -1,
      parallel: configuration.isParallel()
    }).getTask();
    const parsingErrors = taskFileParser.getFilesErrors();
    const finalReports = await new TaskRunner(this.enqueuerTask).run();
    await this.publishReports(configuration.getOutputs(), finalReports, parsingErrors);
    return finalReports;
  }

  private async publishReports(
    configurationOutputs: ActuatorModel[],
    finalReports: output.TaskModel[],
    parsingErrors: TestModel[]
  ) {
    Logger.info('Publishing reports');
    const valid = parsingErrors.length === 0;
    const outputs = new MultiTestsOutput(configurationOutputs);
    //TODO fix this useless await
    await finalReports.map(async report => {
      report.hooks!.onParsed = {
        valid: valid,
        tests: parsingErrors
      };
      report.valid = report.valid && valid;
      await outputs.publishReport(report);
    });
    return finalReports;
  }

  private static async printReport(report: output.TaskModel): Promise<void> {
    const configuration = Configuration.getInstance();
    if (report.level === undefined || report.level <= configuration.getMaxReportLevelPrint()) {
      try {
        let printChildren = true;
        if (report.level === 0) {
          console.log(`   ----------------`);
          printChildren = false;
        }

        const summaryTestOutput = new SummaryTestOutput(report, {
          maxLevel: configuration.getMaxReportLevelPrint(),
          showPassingTests: configuration.getShowPassingTests(),
          printChildren: printChildren
        });
        await summaryTestOutput.print();
      } catch (err) {
        Logger.warning(`Runner errored: ` + err);
      }
    }
  }
}
