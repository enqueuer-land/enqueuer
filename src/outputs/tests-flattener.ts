import { ReportModel } from '../models/outputs/report-model';
import { TestModel } from '../models/outputs/test-model';

export interface FlattenTest extends TestModel {
  hierarchy: string[];
}

export class TestsFlattener {
  public flatten(node: ReportModel): FlattenTest[] {
    const iterationCounter = node.totalIterations > 1 ? ` [${node.iteration}]` : '';
    const name = node.name + iterationCounter;
    return this.goDeep({ ...node, name }, [name]);
  }

  private goDeep(node: ReportModel, hierarchy: string[]): FlattenTest[] {
    const tests = this.getTests(node, hierarchy);
    const nested = this.deepTests(node, hierarchy);
    return tests.concat(nested);
  }

  private deepTests(node: ReportModel, hierarchy: string[]) {
    return (node.sensors || [])
      .concat(node.actuators || [])
      .concat(node.tasks || [])
      .reduce((acc: FlattenTest[], component: ReportModel) => {
        const iterationCounter = component.totalIterations > 1 ? ` [${component.iteration}]` : '';
        const name = component.name + iterationCounter;
        return acc.concat(this.goDeep({ ...component, name }, hierarchy.concat(name)));
      }, []);
  }

  private getTests(node: ReportModel, hierarchy: string[]): FlattenTest[] {
    if (!node.hooks) {
      return [];
    }
    return Object.keys(node.hooks).reduce(
      (acc, hookName) =>
        acc.concat(
          node.hooks![hookName].tests.map((test: TestModel) => {
            return {
              ...test,
              hierarchy: hierarchy.concat(hookName)
            } as FlattenTest;
          })
        ),
      [] as FlattenTest[]
    );
  }
}
