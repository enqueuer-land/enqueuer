import { TaskModel } from '../models/inputs/task-model';

export class ComponentParentBackupper {
  private readonly parentMap: any = {};

  public removeParents(task: TaskModel): void {
    this.parentMap[task.id] = task.parent;
    delete task.parent;
    (task.tasks || []).map(child => this.removeParents(child));
    (task.actuators || []).concat(task.sensors || []).map(leaf => {
      this.parentMap[leaf.id] = leaf.parent;
      delete leaf.parent;
    });
  }

  public putParentsBack(task: TaskModel): void {
    task.parent = this.parentMap[task.id];
    (task.tasks || []).map(child => this.putParentsBack(child));
    (task.actuators || []).concat(task.sensors || []).map(leaf => (leaf.parent = this.parentMap[leaf.id]));
  }
}
