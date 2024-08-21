import { DynamicModulesManager } from '../plugins/dynamic-modules-manager';
import { YmlObjectParser } from '../object-parser/yml-object-parser';
import { TaskParser } from './task-parser';

describe('TaskParser', () => {
  beforeEach(() => {
    // @ts-ignore
    delete DynamicModulesManager.instance;
  });

  it('Should parse array as just one', () => {
    const tasksInput = [
      {
        onInit: {},
        id: 0
      },
      {
        actuators: [{ type: true }],
        name: 'named',
        id: 1
      }
    ];
    DynamicModulesManager.getInstance()
      .getObjectParserManager()
      .addObjectParser(() => {
        return {
          parse: () => tasksInput
        };
      }, 'yml');

    const fileContent = JSON.stringify(tasksInput);
    const task = new TaskParser().parse(fileContent);

    expect(task.tasks[0].id).toBe(tasksInput[0].id);
    expect(task.tasks[0].onInit).toEqual(tasksInput[0].onInit);

    expect(task.tasks[1].name).toBe(tasksInput[1].name);
    expect(task.tasks[1].id).toBe(tasksInput[1].id);
    expect(task.tasks[1].actuators).toEqual(tasksInput[1].actuators);
  });

  it('Should throw', () => {
    expect(() => new TaskParser().parse('anyStuff')).toThrow();
  });

  it('Should add errors if file is not yml nor json', () => {
    const notYml = 'foo bar\nfoo: bar';

    DynamicModulesManager.getInstance()
      .getObjectParserManager()
      .addObjectParser(() => {
        return {
          parse: value => new YmlObjectParser().parse(value)
        };
      }, 'yml');

    try {
      new TaskParser().parse('any:1\nany:1');
      expect(true).toBeFalsy();
    } catch (err) {
      expect(err).toBeDefined();
    }
  });

  it('Should add error if it is not a valid task', () => {
    const notYml = 'hey: bar';

    DynamicModulesManager.getInstance()
      .getObjectParserManager()
      .addObjectParser(() => {
        return {
          parse: value => new YmlObjectParser().parse(value)
        };
      }, 'yml');

    try {
      new TaskParser().parse(notYml);
      expect(true).toBeFalsy();
    } catch (err) {
      expect(err).toBe(
        `'hey: bar' is not a valid task:` +
          ` Unable to find: 'onInit', 'onFinish', 'delay', 'tasks', 'actuators', 'sensors' nor 'import'.`
      );
    }
  });
});
