import { DynamicModulesManager } from '../plugins/dynamic-modules-manager';
import * as fs from 'fs';
import { TaskFileParser } from './task-file-parser';
import * as glob from 'glob';

jest.mock('fs');
jest.mock('glob');
// @ts-ignore
glob.sync.mockImplementation((pattern: string) => [pattern]);

describe('TaskFileParser', () => {
  beforeEach(() => {
    // @ts-ignore
    delete DynamicModulesManager.instance;
  });

  it('Should parse array as just one', () => {
    const taskInput = {
      onInit: {},
      id: 0
    };
    DynamicModulesManager.getInstance()
      .getObjectParserManager()
      .addObjectParser(() => {
        return {
          parse: () => taskInput
        };
      }, 'yml');

    const fileContent = JSON.stringify(taskInput);
    // @ts-ignore
    fs.readFileSync.mockImplementationOnce(() => Buffer.from(fileContent));
    const filename = 'anyStuff';

    const task = new TaskFileParser().parseFile(filename);

    expect(task.name).toBe(filename);
    expect(task.id).toBe(taskInput.id);
    expect(task.onInit).toEqual(taskInput.onInit);
  });

  it('Should throw', () => {
    // @ts-ignore
    fs.readFileSync.mockImplementationOnce(() => {
      throw 'error';
    });
    expect(() => new TaskFileParser().parseFile('anyStuff')).toThrow();
  });
});
