import { ComponentParentBackupper } from './component-parent-backupper';

describe('ComponentParentBackupper', () => {
  it('should remove parents', () => {
    const task: any = {
      name: 'task'
    };
    const child = {
      name: 'actuator',
      parent: task
    };
    const actuator = {
      name: 'actuator',
      parent: task
    };
    const sensor = {
      name: 'sensor',
      parent: task
    };

    task.tasks = [child];
    task.actuators = [actuator];
    task.sensors = [sensor];

    new ComponentParentBackupper().removeParents(task);

    expect(task.tasks[0].parent).toBeUndefined();
    expect(task.actuators[0].parent).toBeUndefined();
    expect(task.sensors[0].parent).toBeUndefined();
  });

  it('should put parents back', () => {
    const task: any = {
      name: 'task',
      id: 'task'
    };
    const child = {
      name: 'child',
      id: 'child',
      parent: task
    };
    const actuator = {
      name: 'actuator',
      id: 'actuator',
      parent: task
    };
    const sensor = {
      name: 'sensor',
      id: 'sensor',
      parent: task
    };
    task.tasks = [child];
    task.actuators = [actuator];
    task.sensors = [sensor];

    const componentParentBackupper = new ComponentParentBackupper();
    componentParentBackupper.removeParents(task);
    componentParentBackupper.putParentsBack(task);

    expect(task.tasks[0].parent.name).toBe(task.name);
    expect(task.actuators[0].parent.name).toBe(task.name);
    expect(task.sensors[0].parent.name).toBe(task.name);
  });
});
