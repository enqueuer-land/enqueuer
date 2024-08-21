import { TaskModel } from '../models/inputs/task-model';
import { TaskParser } from './task-parser';
import * as fs from 'fs';

export class TaskFileParser {
  public parseFile(filename: string): TaskModel {
    const fileBufferContent = fs.readFileSync(filename).toString();
    const task = new TaskParser().parse(fileBufferContent);
    task.name = task.name || filename;
    return task;
  }
}
