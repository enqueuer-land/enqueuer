import { TaskAdopter } from './task-adopter';

describe('TaskAdopter', () => {
  it('Should set default values', () => {
    const parent = new TaskAdopter({}).getTask();

    expect(parent.name).toBe('Task #0');
    expect(parent.id).toBeDefined();
    expect(parent.parent).toBeUndefined();
    expect(parent.tasks).toEqual([]);
    expect(parent.actuators).toEqual([]);
    expect(parent.sensors).toEqual([]);
    expect(parent.delay).toBe(0);
    expect(parent.level).toBe(0);
    expect(parent.iterations).toBe(1);
  });

  it('Should override default values', () => {
    const name = 'specialName';

    const parent = new TaskAdopter({
      name: name,
      id: 'otherId',
      value: 123,
      delay: 10000,
      level: 5,
      iterations: 9
    }).getTask();

    expect(parent.value).toBe(parent.value);
    expect(parent.name).toBe(parent.name);
    expect(parent.id).toBe(parent.id);
    expect(parent.actuators).toEqual([]);
    expect(parent.sensors).toEqual([]);
    expect(parent.tasks).toEqual([]);
    expect(parent.delay).toBe(parent.delay);
    expect(parent.level).toBe(parent.level);
    expect(parent.iterations).toBe(parent.iterations);
  });

  it('Should initialize actuators', () => {
    const name = 'specialName';

    const actuators = [
      {
        type: 'first',
        name: 'firstName',
        extraValue: 123
      },
      {}
    ];
    const parent = new TaskAdopter({
      name,
      actuators: actuators
    }).getTask();

    expect(parent.actuators[0].name).toBe(actuators[0].name);
    expect(parent.actuators[0].type).toBe(actuators[0].type);
    expect(parent.actuators[0].extraValue).toBe(actuators[0].extraValue);
    expect(parent.actuators[0].parent.name).toBe(name);
    expect(parent.actuators[0].parent.actuators[0].name).toBe(actuators[0].name);

    expect(parent.actuators[1].name).toBe('Actuator #1');
    expect(parent.actuators[1].type).toBe(actuators[1].type);
    expect(parent.actuators[1].extraValue).toBe(actuators[1].extraValue);
    expect(parent.actuators[1].parent.name).toBe(name);
    expect(parent.actuators[1].parent.actuators[1].name).toBe('Actuator #1');
  });

  it('Should initialize sensors', () => {
    const name = 'specialName';

    const sensors = [
      {
        type: 'first',
        extraValue: 123
      },
      {
        name: 'secondName'
      }
    ];
    const parent = new TaskAdopter({
      name,
      sensors: sensors
    }).getTask();

    expect(parent.sensors[0].name).toBe('Sensor #0');
    expect(parent.sensors[0].type).toBe(sensors[0].type);
    expect(parent.sensors[0].extraValue).toBe(sensors[0].extraValue);
    expect(parent.sensors[0].parent.name).toBe(name);
    expect(parent.sensors[0].parent.sensors[0].name).toBe('Sensor #0');

    expect(parent.sensors[1].name).toBe(sensors[1].name);
    expect(parent.sensors[1].type).toBe(sensors[1].type);
    expect(parent.sensors[1].extraValue).toBe(sensors[1].extraValue);
    expect(parent.sensors[1].parent.name).toBe(name);
    expect(parent.sensors[1].parent.sensors[1].name).toBe(sensors[1].name);
  });

  it('Should initialize tasks', () => {
    const name = 'specialName';

    const tasks = [
      {
        extraValue: 123
      },
      {}
    ];
    const parent = new TaskAdopter({
      name,
      tasks
    }).getTask();

    expect(parent.name).toBe(name);
    expect(parent.tasks[0].name).toBe('Task #0');
    expect(parent.tasks[0].extraValue).toBe(tasks[0].extraValue);

    expect(parent.tasks[1].name).toBe('Task #1');
    expect(parent.tasks[1].extraValue).toBe(tasks[1].extraValue);
    expect(parent.tasks[1].parent!.name).toBe(name);
    expect(parent.tasks[1].parent!.tasks[1].name).toBe('Task #1');
  });

  it('should merge with default values', () => {
    const tasks = [
      {
        delay: 200,
        tasks: [
          {
            delay: 100
          }
        ],
        name: 'examples/no-tests.yml'
      }
    ];

    const task = new TaskAdopter({
      name: 'name',
      tasks,
      level: 6
    }).getTask();

    expect(task.name).toBe('name');
    expect(task.id).toBeDefined();
    expect(task.parent).toBeUndefined();
    expect(task.actuators).toEqual([]);
    expect(task.sensors).toEqual([]);
    expect(task.delay).toBe(0);
    expect(task.level).toBe(6);
    expect(task.iterations).toBe(1);

    expect(task.tasks[0].name).toBe('examples/no-tests.yml');
    expect(task.tasks[0].id).toBeDefined();
    expect(task.tasks[0].parent!.name).toBe('name');
    expect(task.tasks[0].tasks[0].delay).toBe(100);
    expect(task.tasks[0].tasks[0].level).toBe(8);
    expect(task.tasks[0].actuators).toEqual([]);
    expect(task.tasks[0].sensors).toEqual([]);
    expect(task.tasks[0].delay).toBe(200);
    expect(task.tasks[0].level).toBe(7);
    expect(task.tasks[0].iterations).toBe(1);
  });

  it('should set parents', () => {
    const parent = {
      name: 'parent',
      tasks: [{ name: 'req' }],
      actuators: [{ name: 'pub' }],
      sensors: [{ name: 'sub' }]
    };

    const task = new TaskAdopter(parent).getTask();

    expect(task.tasks[0].parent!.name).toBe('parent');
    expect(task.actuators[0].parent.name).toBe('parent');
    expect(task.sensors[0].parent.name).toBe('parent');
  });
});
