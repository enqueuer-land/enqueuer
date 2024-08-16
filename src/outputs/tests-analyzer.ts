import { RequisitionModel } from '../models/outputs/requisition-model';
import { ReportModel } from '../models/outputs/report-model';
import { TestModel, testModelIsPassing } from '../models/outputs/test-model';
import { HookModel } from '../models/outputs/hook-model';

export class TestsAnalyzer {
  private tests: TestModel[] = [];

  public addTest(report: ReportModel): TestsAnalyzer {
    this.findRequisitions(report);
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

  private findRequisitions(requisition: ReportModel) {
    this.findTests(requisition);
    (requisition.requisitions || []).forEach((child: RequisitionModel) => {
      this.findRequisitions(child);
    });
  }

  private findTests(requisition: ReportModel) {
    this.computeComponent(requisition as RequisitionModel);
    for (const child of (requisition.subscriptions || []).concat(requisition.publishers || [])) {
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
