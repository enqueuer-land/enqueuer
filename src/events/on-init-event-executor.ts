import {Logger} from '../loggers/logger';
import {EventExecutor} from './event-executor';
import {Initializable} from './initializable';
import {TestModel} from '../models/outputs/test-model';

//TODO test it
export class OnInitEventExecutor extends EventExecutor {
    private initializable: Initializable;

    constructor(name: string, initializable: Initializable) {
        super(initializable.onInit);
        this.initializable = initializable;
        this.addArgument(name, this.initializable);
    }

    public trigger(): TestModel[] {
        Logger.trace(`Executing onInit`);
        if (!this.initializable.onInit) {
            Logger.trace(`No onOnInit to be played here`);
            return [];
        }
        return this.execute().map(test => {
            return {name: test.label, valid: test.valid, description: test.errorDescription};
        });
    }

}