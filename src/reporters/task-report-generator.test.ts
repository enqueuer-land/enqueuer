import { TaskReportGenerator } from './task-report-generator';
import { DefaultHookEvents } from '../models/events/event';

let sleep = (millisecondsToWait: number): void => {
  const waitTill = new Date(new Date().getTime() + millisecondsToWait);
  while (waitTill > new Date()) {
    //wait
  }
};

describe('TaskReportGenerator', () => {
  it('Create default report', () => {
    // @ts-expect-error
    const report = new TaskReportGenerator({
      name: 'testName'
    }).getReport();
    expect(report.time).toBeDefined();
    expect(report).toEqual({
      hooks: {
        onFinish: { arguments: {}, tests: [], valid: true },
        onInit: { arguments: {}, tests: [], valid: true }
      },
      iteration: undefined,
      totalIterations: undefined,
      time: {
        endTime: expect.any(String),
        startTime: expect.any(String),
        totalTime: expect.any(Number)
      },
      id: undefined,
      ignored: undefined,
      level: undefined,
      name: 'testName',
      actuators: [],
      tasks: [],
      sensors: [],
      valid: true
    });
  });

  it('Time report with timeout', () => {
    const timeout = 1000;
    // @ts-expect-error
    const reportGenerator = new TaskReportGenerator({ name: 'someName' }, timeout);
    const firstReport = reportGenerator.getReport();
    const firstStartTime = new Date(firstReport.time.startTime.valueOf()).getTime();

    sleep(20);
    reportGenerator.finish();

    const secondReport = reportGenerator.getReport();
    expect(new Date(secondReport.time.startTime).getTime()).toBeGreaterThanOrEqual(firstStartTime);
    expect(secondReport.time.timeout).toBeGreaterThanOrEqual(timeout);
    delete secondReport.tests;

    expect(secondReport).toEqual({
      hooks: {
        onFinish: { arguments: {}, tests: [], valid: true },
        onInit: { arguments: {}, tests: [], valid: true }
      },
      iteration: undefined,
      totalIterations: undefined,
      time: {
        endTime: expect.any(String),
        startTime: expect.any(String),
        timeout: 1000,
        totalTime: expect.any(Number)
      },
      id: undefined,
      ignored: undefined,
      level: undefined,
      name: 'someName',
      actuators: [],
      tasks: [],
      sensors: [],
      valid: true
    });
  });

  it('Time out test fail', () => {
    const timeout = 10;
    // @ts-expect-error
    const reportGenerator = new TaskReportGenerator({ name: 'someName' }, timeout);
    sleep(50);
    reportGenerator.finish();

    const report = reportGenerator.getReport();
    expect(report.valid).toBeFalsy();
    expect(report.hooks![DefaultHookEvents.ON_FINISH].tests.length).toBe(1);
    expect(report.hooks![DefaultHookEvents.ON_FINISH].valid).toBeFalsy();
    expect(report.hooks![DefaultHookEvents.ON_FINISH].tests[0].name).toBe('No time out');
    expect(report.hooks![DefaultHookEvents.ON_FINISH].tests[0].implicit).toBeTruthy();
    expect(report.hooks![DefaultHookEvents.ON_FINISH].tests[0].valid).toBeFalsy();
    expect(report.hooks![DefaultHookEvents.ON_FINISH].tests[0].description).toBeDefined();
  });

  it('Time report without timeout', () => {
    // @ts-expect-error
    const reportGenerator = new TaskReportGenerator({
      name: 'someName'
    });

    reportGenerator.finish();

    const time = reportGenerator.getReport().time;

    expect(time.startTime).toBeDefined();
    expect(time.endTime).toBeDefined();
    expect(time.totalTime).toBe(new Date(time.endTime).getTime() - new Date(time.startTime).getTime());
    expect(time.timeout).toBeUndefined();
  });

  it('Adding actuator report', () => {
    // @ts-expect-error
    const reportGenerator = new TaskReportGenerator({
      name: 'someName'
    });

    let report = reportGenerator.getReport();
    expect(report.valid).toBeTruthy();
    expect(report.actuators.length).toBe(0);

    // @ts-expect-error
    reportGenerator.setActuatorsReport([{ valid: false }]);
    reportGenerator.finish();
    report = reportGenerator.getReport();

    expect(report.valid).toBeFalsy();
    expect(report.actuators.length).toBe(1);
    expect(report.actuators[0].valid).toBeFalsy();
  });

  it('Adding sensor report', () => {
    // @ts-expect-error
    const reportGenerator = new TaskReportGenerator({
      name: 'someName'
    });

    let report = reportGenerator.getReport();
    expect(report.valid).toBeTruthy();
    expect(report.sensors.length).toBe(0);

    // @ts-expect-error
    reportGenerator.setSensorsReport([{ valid: false }]);
    reportGenerator.finish();
    report = reportGenerator.getReport();

    expect(report.valid).toBeFalsy();
    expect(report.sensors.length).toBe(1);
    expect(report.sensors[0].valid).toBeFalsy();
  });

  it('Adding tests', () => {
    // @ts-expect-error
    const reportGenerator = new TaskReportGenerator({
      name: 'someName'
    });

    reportGenerator.addTest('hookName', {
      valid: false,
      arguments: { a: 1 },
      // @ts-expect-error
      tests: [{ name: 'a', valid: false }]
    });
    reportGenerator.addTest('hookName', {
      valid: true,
      arguments: { b: 3 },
      // @ts-expect-error
      tests: [{ name: 'b', valid: true }]
    });
    reportGenerator.finish();
    const report = reportGenerator.getReport();

    expect(report.valid).toBeFalsy();
    expect(report.hooks!.hookName).toEqual({
      arguments: { a: 1, b: 3 },
      tests: [
        { name: 'a', valid: false },
        { name: 'b', valid: true }
      ],
      valid: false
    });
  });
});
