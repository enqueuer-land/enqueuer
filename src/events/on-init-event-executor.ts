import {Logger} from '../loggers/logger';
import {EventAsserter} from './event-asserter';
import {Initializable} from './initializable';
import {EventExecutor} from './event-executor';
import {TestModel} from '../models/outputs/test-model';

//TODO test it
export class OnInitEventExecutor implements EventExecutor {
    private initializable: Initializable;
    private name: string;

    constructor(name: string, initializable: Initializable) {
        this.initializable = initializable;
        this.name = name;
    }

    public execute(): TestModel[] {
        Logger.trace(`Executing onInit`);
        if (!this.initializable.onInit) {
            Logger.trace(`No onOnInit to be played here`);
            return [];
        }
        return this.buildEventAsserter().assert().map(test => {
            return {name: test.label, valid: test.valid, description: test.errorDescription};
        });
    }

    private buildEventAsserter() {
        const eventTestExecutor = new EventAsserter(this.initializable.onInit);
        eventTestExecutor.addArgument(this.name, this.initializable);
        return eventTestExecutor;
    }
}