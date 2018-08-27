import {Logger} from '../loggers/logger';
import {EventExecutor} from './event-executor';
import {Initializable} from './initializable';
import {TestModel} from '../models/outputs/test-model';

export class OnInitEventExecutor extends EventExecutor {
    private initializable: Initializable;

    constructor(name: string, initializable: Initializable) {
        super(initializable.onInit);
        this.initializable = initializable;
        this.addArgument(name, this.initializable);
    }

    public trigger(): TestModel[] {
        if (!this.initializable.onInit) {
            return [];
        }
        Logger.trace(`Executing onInit`);
        return this.execute();
    }

}