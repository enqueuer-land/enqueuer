import { TestsAnalyzer } from './tests-analyzer';
import { TaskModel } from '../models/outputs/task-model';
import { ReportModel } from '../models/outputs/report-model';
import { TestModel } from '../models/outputs/test-model';

describe('TestsAnalyzer', () => {
  const createTest = (valid: boolean, ignored?: boolean): TestModel => {
    return {
      valid,
      ignored,
      description: 'description',
      name: 'name'
    };
  };

  it('Percentage should be zero when there are no tests', () => {
    const test: ReportModel = {
      name: 'name',
      valid: true,
      tests: []
    };

    const testsAnalyzer = new TestsAnalyzer().addTest(test);

    expect(testsAnalyzer.getFailingTests().length).toBe(0);
    expect(testsAnalyzer.getTests().length).toBe(0);
    expect(testsAnalyzer.getPercentage()).toBe(100);
  });

  it('Should trunc percentage to two decimals number', () => {
    const test: TaskModel = {
      name: 'name',
      valid: true,
      hooks: {
        onInit: {
          valid: true,
          tests: [{ valid: true, description: 'description', name: 'name' }]
        }
      },
      tasks: [
        {
          name: 'name',
          valid: true,
          // @ts-ignore
          time: {},
          actuators: [
            // @ts-ignore
            {
              name: 'name',
              valid: false,
              hooks: {
                onInit: { valid: false, tests: [createTest(false)] },
                onFinish: { valid: true, tests: [createTest(true)] }
              }
            }
          ]
        }
      ]
    };

    const testsAnalyzer = new TestsAnalyzer().addTest(test);

    expect(testsAnalyzer.getTests().length).toBe(3);
    expect(testsAnalyzer.getFailingTests().length).toBe(1);
    expect(testsAnalyzer.getPercentage()).toBe(66.66);
  });

  it('Should count inner tests', () => {
    const test: ReportModel = {
      name: 'name',
      valid: true,
      hooks: {
        onInit: { valid: true, tests: [createTest(true)] }
      }
    };

    const testsAnalyzer = new TestsAnalyzer().addTest(test);

    expect(testsAnalyzer.getFailingTests().length).toBe(0);
    expect(testsAnalyzer.getTests().length).toBe(1);
    expect(testsAnalyzer.getPercentage()).toBe(100);
  });

  it('Should ignore ignored test to calculate percentage', () => {
    const test: ReportModel = {
      name: 'name',
      valid: false,
      hooks: {
        onInit: {
          valid: true,
          tests: [createTest(false, true), createTest(true, true)]
        },
        onFinish: {
          valid: false,
          tests: [createTest(true, false), createTest(false, undefined)]
        }
      }
    };

    const testsAnalyzer = new TestsAnalyzer().addTest(test);

    expect(testsAnalyzer.getFailingTests().length).toBe(1);
    expect(testsAnalyzer.getTests().length).toBe(4);
    expect(testsAnalyzer.getPassingTests().length).toBe(1);
    expect(testsAnalyzer.getNotIgnoredTests().length).toBe(2);
    expect(testsAnalyzer.getPercentage()).toBe(50);
  });

  it('Should ignore ignored test to validate', () => {
    const test: ReportModel = {
      name: 'name',
      valid: true,
      tests: [createTest(true), createTest(true, true), createTest(true, true)]
    };

    const testsAnalyzer = new TestsAnalyzer().addTest(test);

    expect(testsAnalyzer.isValid()).toBeTruthy();
  });

  it('Should get filtered tests', () => {
    const test: ReportModel = {
      name: 'name',
      description: 'name',
      hooks: {
        onEvent: {
          valid: false,
          tests: [createTest(true), createTest(true), createTest(true), createTest(false), createTest(false, true)]
        }
      },
      valid: false
    };

    const testsAnalyzer = new TestsAnalyzer().addTest(test);

    expect(testsAnalyzer.getFailingTests().length).toBe(1);
    expect(testsAnalyzer.getPassingTests().length).toBe(3);
    expect(testsAnalyzer.getIgnoredList().length).toBe(1);
    expect(testsAnalyzer.getTests().length).toBe(5);
    expect(testsAnalyzer.getNotIgnoredTests().length).toBe(4);
  });

  it('Should ignore even when there is test child', () => {
    const test: ReportModel = {
      name: 'name',
      valid: true,
      ignored: true,
      hooks: {
        onInit: {
          valid: false,
          tests: [createTest(false)]
        }
      }
    };

    const testsAnalyzer = new TestsAnalyzer().addTest(test);

    expect(testsAnalyzer.getFailingTests().length).toBe(0);
    expect(testsAnalyzer.getPassingTests().length).toBe(0);
    expect(testsAnalyzer.getIgnoredList().length).toBe(1);
    expect(testsAnalyzer.getTests().length).toBe(1);
    expect(testsAnalyzer.getNotIgnoredTests().length).toBe(0);
  });

  it('Should print regular tests', () => {
    const test: ReportModel = {
      name: 'name',
      valid: false,
      tests: [createTest(false), createTest(true)]
    };

    const testsAnalyzer = new TestsAnalyzer().addTest(test);

    expect(testsAnalyzer.getFailingTests().length).toBe(1);
    expect(testsAnalyzer.getPassingTests().length).toBe(1);
    expect(testsAnalyzer.getIgnoredList().length).toBe(0);
    expect(testsAnalyzer.getTests().length).toBe(2);
    expect(testsAnalyzer.getNotIgnoredTests().length).toBe(2);
  });
});
