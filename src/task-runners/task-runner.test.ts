import { TaskRunner } from './task-runner';
import { TaskModel } from '../models/inputs/task-model';
import { Store } from '../configurations/store';

describe('TaskRunner', () => {
  it('Should return task reporter skipped', async () => {
    // @ts-ignore
    const task: TaskModel = {
      iterations: 0,
      name: 'skipped',
      id: 'id'
    };

    const reports = await new TaskRunner(task).run();
    const actual = reports[0];

    expect(reports.length).toBe(1);
    expect(actual.name).toBe(task.name);
    expect(actual.id).toBe(task.id);
    expect(actual.valid).toBeTruthy();
    expect(actual.hooks!.onInit.valid).toBeTruthy();
    expect(actual.hooks!.onFinish.valid).toBeTruthy();
  });

  it('Should return task report collection', async () => {
    const task: TaskModel = {
      name: 'super cool',
      iterations: 5,
      tasks: [],
      actuators: [],
      sensors: []
    } as any;

    const reports = await new TaskRunner(task).run();
    const report = reports[0];

    expect(reports.length).toBe(task.iterations);
    expect(report.time).toBeDefined();
    expect(report.name).toContain(task.name);
    expect(report.valid).toBeTruthy();
  });

  it('Should run children task report collection', async () => {
    const task: TaskModel = {
      name: 'super cool',
      tasks: [
        // @ts-expect-error
        {
          name: 'child',
          actuators: [],
          sensors: [],
          tasks: []
        }
      ],
      actuators: [],
      sensors: []
    };

    const reports = await new TaskRunner(task).run();
    const report = reports[0].tasks[0];

    expect(report.time).toBeDefined();
    expect(report.name).toContain('child');
    expect(report.valid).toBeTruthy();
  });

  it('Should replace stuff', async () => {
    const keyName = 'value';
    Store.getData().keyName = keyName;
    // @ts-ignore
    const task: TaskModel = {
      name: '<<keyName>>'
    };

    const reports = await new TaskRunner(task).run();
    const report = reports[0];

    expect(reports.length).toBe(1);
    expect(report.name).toBe(keyName);
  });
});
