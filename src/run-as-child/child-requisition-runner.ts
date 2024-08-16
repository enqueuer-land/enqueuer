import { RequisitionRunner } from '../requisition-runners/requisition-runner';
import { ParentReplier } from './parent-replier';

export class ChildRequisitionRunner implements ParentReplier {
    public async process(message: any): Promise<boolean> {
        await new RequisitionRunner(message.value).run();
        return true;
    }
}
