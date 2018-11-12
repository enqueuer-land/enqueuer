import {RequisitionModel} from '../models/inputs/requisition-model';
import {Logger} from '../loggers/logger';

export class IterationsEvaluator {

    public evaluate(requisition: RequisitionModel): number {
        if (!requisition) {
            return 0;
        }
        if (requisition.iterations !== undefined) {
            try {
                const evaluated = eval(requisition.iterations.toString());
                switch (typeof evaluated) {
                    case 'boolean':
                        return evaluated ? 1 : 0;
                    case 'number':
                    default:
                        return evaluated;
                }
            } catch (err) {
                Logger.warning(`Error evaluating iterations: $${requisition.iterations}: ${err}`);
                return 0;
            }
        }

        return 1;
    }
}
