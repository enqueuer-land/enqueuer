import { TaskModel } from '../models/outputs/task-model';
import { ReportModel } from '../models/outputs/report-model';
import { TestModel, testModelIsPassing } from '../models/outputs/test-model';
import { HookModel } from '../models/outputs/hook-model';

export class TestsAnalyzer {
  private tests: TestModel[] = [];

  public addTest(report: ReportModel): TestsAnalyzer {
    this.findTasks(report);
    return this;
  }

  public isValid(): boolean {
    return this.getNotIgnoredTests().every(test => test.valid);
  }

  public getTests(): TestModel[] {
    return this.tests;
  }

  public getNotIgnoredTests(): TestModel[] {
    return this.tests.filter(test => test.ignored === false || test.ignored === undefined);
  }

  public getIgnoredList(): TestModel[] {
    return this.tests.filter(test => test.ignored === true && test.ignored !== undefined);
  }

  public getPassingTests(): TestModel[] {
    return this.tests.filter(test => test.valid === true && (test.ignored === false || test.ignored === undefined));
  }

  public getFailingTests(): TestModel[] {
    return this.tests.filter(test => test.valid === false && (test.ignored === false || test.ignored === undefined));
  }

  public getPercentage(): number {
    const notIgnoredTestsLength = this.getNotIgnoredTests().length;
    if (notIgnoredTestsLength === 0) {
      return 100;
    }
    return Math.trunc((10000 * this.getPassingTests().length) / notIgnoredTestsLength) / 100;
  }

  private findTasks(task: ReportModel) {
    this.findTests(task);
    (task.tasks || []).forEach((child: TaskModel) => {
      this.findTasks(child);
    });
  }

  private findTests(task: ReportModel) {
    this.computeComponent(task as TaskModel);
    for (const child of (task.sensors || []).concat(task.actuators || [])) {
      this.computeComponent(child);
    }
  }

  private computeComponent(reportModel: ReportModel): void {
    if (reportModel.ignored) {
      this.tests.push({
        ...reportModel,
        description: reportModel.description || 'Ignored'
      });
    } else {
      Object.keys(reportModel.hooks || {}).forEach((key: string) => {
        const hook = reportModel.hooks![key] as HookModel;
        this.tests = this.tests.concat(hook.tests || []);
      });
      this.tests = this.tests.concat(reportModel.tests || []);
    }
  }
}
