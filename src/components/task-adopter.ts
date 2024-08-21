import { IdGenerator } from '../strings/id-generator';
import { TaskModel } from '../models/inputs/task-model';
import { ActuatorModel } from '../models/inputs/actuator-model';
import { SensorModel } from '../models/inputs/sensor-model';

export class TaskAdopter {
  private readonly task: TaskModel;
  private defaultModel: any = {
    sensors: [],
    actuators: [],
    tasks: [],
    delay: 0,
    iterations: 1,
    level: 0,
    parallel: false,
    ignore: false
  };

  constructor(node: any) {
    this.task = this.baptiseTask(node, node.name ? node.name : `Task #0`);
  }

  public getTask(): TaskModel {
    return this.task;
  }

  private baptiseTask(task: TaskModel, name?: string, parent?: TaskModel): TaskModel {
    task = Object.assign({}, this.defaultModel, task) as TaskModel;
    this.putNameAndId(task, name, parent);
    task.tasks = task.tasks.map((child, index) => {
      child.level = task.level + 1;
      return this.baptiseTask(child, `Task #${index}`, task) as TaskModel;
    });
    task.actuators = task.actuators.map(
      (actuator, index) => this.putNameAndId(actuator, `Actuator #${index}`, task) as ActuatorModel
    );
    task.sensors = task.sensors.map(
      (sensor, index) => this.putNameAndId(sensor, `Sensor #${index}`, task) as SensorModel
    );
    return task;
  }

  private putNameAndId(component: TaskModel | ActuatorModel | SensorModel, name?: string, parent?: TaskModel) {
    if (!component.name && name) {
      component.name = name;
    }
    if (!component.id) {
      component.id = new IdGenerator(component).generateId();
    }
    if (parent) {
      component.parent = parent;
    }

    return component;
  }
}
