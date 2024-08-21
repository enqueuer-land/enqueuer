import { Logger } from '../loggers/logger';
import { TaskReporter } from '../reporters/task-reporter';
import * as input from '../models/inputs/task-model';
import * as output from '../models/outputs/task-model';
import { JsonPlaceholderReplacer } from 'json-placeholder-replacer';
import { Store } from '../configurations/store';
import { TaskDefaultReports } from '../models-defaults/outputs/task-default-reports';
import { FileContentMapCreator } from '../configurations/file-content-map-creator';
import { IterationsEvaluator } from './iterations-evaluator';
import { ComponentParentBackupper } from '../components/component-parent-backupper';
import { ComponentImporter } from './component-importer';
import { TaskAdopter } from '../components/task-adopter';
import { NotificationEmitter } from '../notifications/notification-emitter';
import { testModelIsNotFailing } from '../models/outputs/test-model';
import { Notifications } from '../notifications/notifications';

export class TaskRunner {
  private task: input.TaskModel;
  private childrenTaskRunner: TaskRunner[] = [];
  private taskReporter?: TaskReporter;

  public constructor(task: input.TaskModel) {
    this.task = new TaskAdopter(task).getTask();
  }

  public async run(): Promise<output.TaskModel[]> {
    NotificationEmitter.emit(Notifications.REQUISITION_STARTED, {
      task: this.task
    });
    Logger.info(`Running task '${this.task.name}'`);
    try {
      this.importTask();
    } catch (err) {
      Logger.error(`Error importing task`);
      const report = TaskDefaultReports.createRunningError(this.task, err);
      this.emitOnFinishNotification(report);
      return [report];
    }
    this.replaceVariables();
    const evaluatedIterations: number = new IterationsEvaluator().iterations(this.task.iterations);
    if (evaluatedIterations <= 0) {
      Logger.info(`Task will be skipped duo to no iterations`);
      const report = TaskDefaultReports.createSkippedReport(this.task);
      this.emitOnFinishNotification(report);
      return [report];
    } else if (this.task.ignore) {
      Logger.info(`Task will be ignored`);
      const report = TaskDefaultReports.createIgnoredReport(this.task);
      this.emitOnFinishNotification(report);
      return [report];
    }
    return await this.iterateTask(evaluatedIterations);
  }

  private async iterateTask(iterations: number): Promise<output.TaskModel[]> {
    const reports = [];
    for (let iterationCounter = 0; iterationCounter < iterations; ++iterationCounter) {
      try {
        this.replaceVariables();
        this.task.iteration = iterationCounter;
        this.task.totalIterations = iterations;
        const iterationSuffix: string = iterations > 1 ? ` [${iterationCounter}]` : '';
        Logger.trace(`Task runner starting task reporter for '${this.task.name + iterationSuffix}'`);
        const report = await this.startTaskReporter();
        reports.push(report);
        this.emitOnFinishNotification(report);
      } catch (err) {
        reports.push(TaskDefaultReports.createRunningError(this.task, '' + err));
        Logger.error('' + err);
      }
    }
    return reports;
  }

  private importTask() {
    if (this.task.import) {
      this.task = new ComponentImporter().importTask(this.task);
    }
  }

  private async interrupt(): Promise<output.TaskModel> {
    const report: output.TaskModel = await this.taskReporter!.interrupt();
    this.emitOnFinishNotification(report);
    return report;
  }

  private emitOnFinishNotification(report: output.TaskModel) {
    NotificationEmitter.emit(Notifications.REQUISITION_FINISHED, {
      task: report
    });
  }

  private replaceVariables(): void {
    Logger.debug(`Evaluating variables of task '${this.task.name}'`);
    const componentParentBackupper = new ComponentParentBackupper();
    componentParentBackupper.removeParents(this.task);
    const fileMapCreator = new FileContentMapCreator(this.task);
    const fileReplaced = new JsonPlaceholderReplacer({ defaultValueSeparator: '->' })
      .addVariableMap(fileMapCreator.getMap())
      .replace(this.task);
    this.task = new JsonPlaceholderReplacer({ defaultValueSeparator: '->' })
      .addVariableMap(Store.getData())
      .replace(fileReplaced) as input.TaskModel;
    componentParentBackupper.putParentsBack(this.task);
  }

  private async startTaskReporter(): Promise<output.TaskModel> {
    this.taskReporter = new TaskReporter(this.task);
    const report = await Promise.race([this.timeoutPath(), this.happyPath()]);

    const iterationCounter: string = +report.totalIterations! > 1 ? ` [${report.iteration}]` : '';
    Logger.info(
      `Task '${report.name + iterationCounter}' is over (status: ${report.valid ? 'OK' : 'Errored'}) - ${report.time ? report.time.totalTime : 0}ms`
    );
    Logger.trace(`Store keys: ${Object.keys(Store.getData()).join('; ')}`);

    return report;
  }

  private async timeoutPath(): Promise<output.TaskModel> {
    const report = await this.taskReporter!.startTimeout();
    report.tasks = await Promise.all(this.childrenTaskRunner.map(childRunner => childRunner.interrupt()));
    Logger.debug(`Task '${this.task.name}' timed out (${this.task.timeout}ms)`);
    return report;
  }

  private async happyPath(): Promise<output.TaskModel> {
    await this.taskReporter!.delay();
    Logger.debug(`Handling tasks children of '${this.task.name}'`);
    let childrenReport: output.TaskModel[] = await this.executeChildren();
    const report = await this.taskReporter!.execute();
    report.tasks = childrenReport;
    report.valid =
      report.valid &&
      report.tasks.every(task => testModelIsNotFailing(task)) &&
      Object.keys(report.hooks || {}).every((key: string) => (report.hooks ? report.hooks[key].valid : true));
    Logger.debug(`Task ${this.task.name} didn't time out`);
    return report;
  }

  private async executeChildren(): Promise<output.TaskModel[]> {
    if (this.task.parallel) {
      const models = await Promise.all(
        this.task.tasks.map(async (child: input.TaskModel, index: number) => {
          return await this.executeChild(child, index);
        })
      );
      return models.reduce((acc, child) => acc.concat(child), []);
    } else {
      let childrenReport: output.TaskModel[] = [];
      let index = 0;
      for (const child of this.task.tasks) {
        childrenReport = childrenReport.concat(await this.executeChild(child, index));
        ++index;
      }
      return childrenReport;
    }
  }

  private async executeChild(child: input.TaskModel, index: number): Promise<output.TaskModel[]> {
    child.parent = this.task;
    const childRunner = new TaskRunner(child);
    this.childrenTaskRunner.push(childRunner);
    const taskModels = await childRunner.run();
    this.task.tasks[index] = childRunner.task;
    return taskModels;
  }
}
