import { TaskFilePatternParser } from './task-file-pattern-parser';
import { DynamicModulesManager } from '../plugins/dynamic-modules-manager';
import { YmlObjectParser } from '../object-parser/yml-object-parser';
import * as fs from 'fs';
import * as glob from 'glob';

jest.mock('fs');
jest.mock('glob');
// @ts-ignore
glob.sync.mockImplementation((pattern: string) => [pattern]);

describe('TaskFilePatternParser', () => {
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
    // @ts-ignore
    fs.readFileSync.mockImplementationOnce(() => Buffer.from(fileContent));
    const filename = 'anyStuff';

    const task = new TaskFilePatternParser([filename]).parse();

    expect(task[0].name).toBe(filename);

    expect(task[0].tasks[0].id).toBe(tasksInput[0].id);
    expect(task[0].tasks[0].onInit).toEqual(tasksInput[0].onInit);

    expect(task[0].tasks[1].name).toBe(tasksInput[1].name);
    expect(task[0].tasks[1].id).toBe(tasksInput[1].id);
    expect(task[0].tasks[1].actuators).toEqual(tasksInput[1].actuators);
  });

  it('Should add invalid file error', () => {
    // @ts-ignore
    fs.readFileSync.mockImplementationOnce(() => {
      throw 'error';
    });
    const parser: TaskFilePatternParser = new TaskFilePatternParser(['anyStuff']);

    parser.parse();

    expect(parser.getFilesErrors()[0]).toEqual({
      description: 'error',
      name: "Error parsing file 'anyStuff'",
      valid: false
    });
  });

  it('Should no test found error', () => {
    const parser: TaskFilePatternParser = new TaskFilePatternParser([]);

    parser.parse();

    expect(parser.getFilesErrors()[0]).toEqual({
      description: 'No test file was found',
      name: 'No test file was found',
      valid: false
    });
  });

  it('Should add if file is not yml nor json', () => {
    const notYml = 'foo bar\nfoo: bar';

    DynamicModulesManager.getInstance()
      .getObjectParserManager()
      .addObjectParser(() => {
        return {
          parse: value => new YmlObjectParser().parse(value)
        };
      }, 'yml');

    // @ts-ignore
    fs.readFileSync.mockImplementationOnce(() => Buffer.from(notYml));

    const parser = new TaskFilePatternParser(['anyStuff']);
    parser.parse();

    const parsedErrorDescription: any = parser.getFilesErrors()[0].description;
    expect(parsedErrorDescription).toBeDefined();
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

    // @ts-ignore
    fs.readFileSync.mockImplementationOnce(() => Buffer.from(notYml));

    const parser = new TaskFilePatternParser(['anyStuff']);
    parser.parse();

    expect(parser.getFilesErrors()[0].name).toBe("Error parsing file 'anyStuff'");
  });

  it('should add every not matching file to error', () => {
    // @ts-ignore
    glob.sync.mockReset();
    // @ts-ignore
    glob.sync.mockImplementationOnce(() => []);

    const parser = new TaskFilePatternParser(['not-matching-pattern']);
    parser.parse();

    expect(parser.getFilesErrors()[0]).toEqual({
      description: "No file was found with: 'not-matching-pattern'",
      name: "No file was found with: 'not-matching-pattern'",
      valid: false
    });
  });
});
