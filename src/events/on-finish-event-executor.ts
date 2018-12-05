import {Logger} from '../loggers/logger';
import {EventExecutor} from './event-executor';
import {TestModel} from '../models/outputs/test-model';
import {Finishable} from '../models/events/finishable';

export class OnFinishEventExecutor extends EventExecutor {
    private readonly finishable: Finishable;

    constructor(name: string, finishable: Finishable) {
        super('onFinish', finishable.onFinish);
        this.finishable = finishable;
        this.addArgument(name, this.finishable);
    }

    public trigger(): TestModel[] {
        if (!this.finishable.onFinish) {
            return [];
        }
        Logger.trace(`Executing onFinish`);
        return this.execute();
    }

}
