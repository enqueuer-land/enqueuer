import { DynamicModulesManager } from '../plugins/dynamic-modules-manager';
import { TaskModel } from '../models/inputs/task-model';
import { TaskValidator } from './task-validator';

export class TaskParser {
  public parse(value: string): TaskModel {
    const parsed: any = DynamicModulesManager.getInstance()
      .getObjectParserManager()
      .tryToParseWithParsers(value, ['yml', 'json']);

    const task = Array.isArray(parsed) ? { tasks: parsed } : parsed;
    const taskValidator = new TaskValidator();
    if (!taskValidator.validate(task)) {
      throw "'" + value + "' is not a valid task: " + taskValidator.getErrorMessage();
    }
    return task;
  }
}
