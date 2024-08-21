import { TaskModel } from '../models/inputs/task-model';

export class TaskValidator {
  public validate(task: TaskModel): boolean {
    if (typeof task !== 'object' || !task) {
      return false;
    }
    if (
      task.onInit !== undefined ||
      task.onFinish !== undefined ||
      task.import !== undefined ||
      task.delay !== undefined
    ) {
      return true;
    }
    if (Array.isArray(task.actuators) && task.actuators.length > 0) {
      return true;
    }
    if (Array.isArray(task.sensors) && task.sensors.length > 0) {
      return true;
    }
    if (Array.isArray(task.tasks) && task.tasks.length > 0) {
      return task.tasks.every(child => this.validate(child));
    }
    return false;
  }

  public getErrorMessage(): string {
    return "Unable to find: 'onInit', 'onFinish', 'delay', 'tasks', 'actuators', 'sensors' nor 'import'.";
  }
}
