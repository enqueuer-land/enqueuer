import {Logger} from '../loggers/logger';
import {EventTestExecutor} from './event-test-executor';
import {Test} from '../testers/test';
import {Initializable} from './initializable';
import {EventExecutor} from './event-executor';

export class OnInitEventExecutor implements EventExecutor {
    private owner: Initializable;

    constructor(owner: Initializable) {
        this.owner = owner;
    }

    public execute(): Test[] {
        Logger.trace(`Executing onInit`);
        if (!this.owner.onInit) {
            Logger.trace(`No onOnInit to be played here`);
            return [];
        }
        return this.buildEventTestExecutor().execute();
    }

    private buildEventTestExecutor() {
        const eventTestExecutor = new EventTestExecutor(this.owner.onInit);
        eventTestExecutor.addArgument(this.owner.name, this.owner.value);
        return eventTestExecutor;
    }
}