import {EnqueuerExecutor} from './enqueuer-executor';
import {Injectable} from 'conditional-injector';
import {Logger} from '../loggers/logger';
import {JavascriptObjectNotation} from '../object-notations/javascript-object-notation';

@Injectable()
export class NullRunExecutor extends EnqueuerExecutor {
    private enqueuerConfiguration: string;

    constructor(enqueuerConfiguration: any) {
        super();
        Logger.info('Executing in Not-Identified mode');
        this.enqueuerConfiguration = new JavascriptObjectNotation().stringify(enqueuerConfiguration) as string;
    }

    public execute(): Promise<boolean> {
        return Promise.reject(`Impossible to execute new executor from: ${this.enqueuerConfiguration}`);
    }
}