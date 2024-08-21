import { TaskRunner } from '../task-runners/task-runner';
import { ParentReplier } from './parent-replier';

export class ChildTaskRunner implements ParentReplier {
  public async process(message: any): Promise<boolean> {
    await new TaskRunner(message.value).run();
    return true;
  }
}
