import { TestsFlattener } from './tests-flattener';
import { ReportModel } from '../models/outputs/report-model';

describe('TestsFlattener', () => {
  it('Flattens tasks', () => {
    const task: ReportModel = {
      name: 'task',
      valid: true,
      hooks: {
        onHook: {
          valid: true,
          tests: [
            {
              description: 'description',
              name: 'test',
              valid: true
            }
          ]
        }
      }
    };

    const flattenTests = new TestsFlattener().flatten(task);
    expect(flattenTests).toEqual([
      {
        description: 'description',
        hierarchy: ['task', 'onHook'],
        name: 'test',
        valid: true
      }
    ]);
  });

  it('Concatenates task #', () => {
    const task: ReportModel = {
      name: 'task',
      iteration: 4,
      totalIterations: 5,
      valid: true,
      hooks: {
        onHook: {
          valid: true,
          tests: [
            {
              description: 'description',
              name: 'test',
              valid: true
            }
          ]
        }
      }
    };

    const flattenTests = new TestsFlattener().flatten(task);
    expect(flattenTests).toEqual([
      {
        description: 'description',
        hierarchy: ['task [4]', 'onHook'],
        name: 'test',
        valid: true
      }
    ]);
  });

  it('Handle empty hooks', () => {
    const task: ReportModel = {
      name: 'task',
      iteration: 4,
      totalIterations: 5,
      valid: true,
      hooks: {}
    };

    const flattenTests = new TestsFlattener().flatten(task);
    expect(flattenTests).toEqual([]);
  });

  it('Flatten deeper actuators', () => {
    const task: ReportModel = {
      name: 'task',
      valid: true,
      actuators: [
        {
          name: 'actuator',
          hooks: {
            onHook: {
              valid: true,
              tests: [
                {
                  description: 'description',
                  name: 'test',
                  valid: true
                }
              ]
            }
          }
        }
      ]
    };

    const flattenTests = new TestsFlattener().flatten(task);
    expect(flattenTests).toEqual([
      {
        description: 'description',
        hierarchy: ['task', 'actuator', 'onHook'],
        name: 'test',
        valid: true
      }
    ]);
  });

  it('Flatten deeper sensors', () => {
    const task: ReportModel = {
      name: 'task',
      valid: true,
      sensors: [
        {
          name: 'sensor',
          hooks: {
            onHook: {
              valid: true,
              tests: [
                {
                  description: 'description',
                  name: 'test',
                  valid: true
                }
              ]
            }
          }
        }
      ]
    };

    const flattenTests = new TestsFlattener().flatten(task);
    expect(flattenTests).toEqual([
      {
        description: 'description',
        hierarchy: ['task', 'sensor', 'onHook'],
        name: 'test',
        valid: true
      }
    ]);
  });

  it('Flatten deeper tasks', () => {
    const task: ReportModel = {
      name: 'task',
      valid: true,
      tasks: [
        {
          name: 'task',
          iteration: 3,
          totalIterations: 5,
          hooks: {
            onHook: {
              valid: true,
              tests: [
                {
                  description: 'description',
                  name: 'test',
                  valid: true
                }
              ]
            }
          }
        }
      ]
    };

    const flattenTests = new TestsFlattener().flatten(task);
    expect(flattenTests).toEqual([
      {
        description: 'description',
        hierarchy: ['task', 'task [3]', 'onHook'],
        name: 'test',
        valid: true
      }
    ]);
  });
});
