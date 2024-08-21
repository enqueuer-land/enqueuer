import { TaskDefaultReports } from './task-default-reports';

describe('TaskDefaultReports', () => {
  it('default', () => {
    const report = TaskDefaultReports.createDefaultReport({
      name: 'g',
      id: 'id',
      level: 13,
      iteration: 1,
      totalIterations: 5
    });
    expect(report.time!.startTime).toBeDefined();
    expect(report.time!.endTime).toBeDefined();
    expect(report.time!.totalTime).toBeLessThan(1000);
    expect(report).toEqual({
      hooks: {
        onFinish: { arguments: {}, tests: [], valid: true },
        onInit: { arguments: {}, tests: [], valid: true }
      },
      time: {
        endTime: expect.any(String),
        startTime: expect.any(String),
        totalTime: expect.any(Number)
      },
      id: 'id',
      iteration: 1,
      totalIterations: 5,
      ignored: undefined,
      level: 13,
      name: 'g',
      actuators: [],
      tasks: [],
      sensors: [],
      valid: true
    });
  });

  it('createIteratorReport', () => {
    // @ts-expect-error
    const report = TaskDefaultReports.createIteratorReport({
      name: 'g'
    });
    expect(report.id).toBeUndefined();
    expect(report).toEqual({
      hooks: {
        onFinish: { arguments: {}, tests: [], valid: true },
        onInit: { arguments: {}, tests: [], valid: true }
      },
      time: {
        endTime: expect.any(String),
        startTime: expect.any(String),
        totalTime: expect.any(Number)
      },
      id: undefined,
      ignored: undefined,
      level: undefined,
      name: 'g',
      actuators: [],
      tasks: [],
      sensors: [],
      valid: true
    });
  });

  it('createRunningError', () => {
    // @ts-expect-error
    const report = TaskDefaultReports.createRunningError({ name: 'lopidio' }, 'err');
    expect(report).toEqual({
      hooks: {
        onFinish: {
          arguments: {},
          tests: [{ description: 'err', name: 'Task ran', valid: false }],
          valid: false
        },
        onInit: { arguments: {}, tests: [], valid: true }
      },
      time: {
        endTime: expect.any(String),
        startTime: expect.any(String),
        totalTime: expect.any(Number)
      },
      id: undefined,
      ignored: undefined,
      level: undefined,
      name: 'lopidio',
      actuators: [],
      tasks: [],
      sensors: [],
      valid: false
    });
  });

  it('createSkippedReport', () => {
    // @ts-expect-error
    const report = TaskDefaultReports.createSkippedReport({
      name: 'virgs'
    });
    expect(report).toEqual({
      hooks: {
        onFinish: {
          arguments: {},
          tests: [
            {
              description: 'There is no iterations set to this task',
              name: 'Task skipped',
              valid: true
            }
          ],
          valid: true
        },
        onInit: { arguments: {}, tests: [], valid: true }
      },
      time: {
        endTime: expect.any(String),
        startTime: expect.any(String),
        totalTime: expect.any(Number)
      },
      id: undefined,
      ignored: undefined,
      level: undefined,
      name: 'virgs',
      actuators: [],
      tasks: [],
      sensors: [],
      valid: true
    });
  });

  it('createIgnoredReport', () => {
    // @ts-expect-error
    const report = TaskDefaultReports.createIgnoredReport({
      name: 'virgs'
    });
    expect(report).toEqual({
      hooks: {
        onFinish: { arguments: {}, tests: [], valid: true },
        onInit: { arguments: {}, tests: [], valid: true }
      },
      time: {
        endTime: expect.any(String),
        startTime: expect.any(String),
        totalTime: expect.any(Number)
      },
      iteration: undefined,
      totalIterations: undefined,
      id: undefined,
      ignored: true,
      name: 'virgs',
      actuators: [],
      tasks: [],
      sensors: [],
      valid: true
    });
  });
});
