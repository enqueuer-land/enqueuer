import {Logger} from '../loggers/logger';

export class IterationsEvaluator {

    public iterations(iterations: number): number {
        if (iterations !== undefined) {
            try {
                const evaluated = eval(iterations.toString());
                switch (typeof evaluated) {
                    case 'boolean':
                        return evaluated ? 1 : 0;
                    case 'number':
                    default:
                        return evaluated;
                }
            } catch (err) {
                Logger.warning(`Error evaluating iterations: $${iterations}: ${err}`);
                return 0;
            }
        }

        return 1;
    }
}
