import {StartEventReporter} from './start-event-reporter';
import {Injectable} from 'conditional-injector';

@Injectable()
export class StartEventNullReporter extends StartEventReporter {

    private startEvent: any;

    public constructor(startEvent: any) {
        super();
        this.startEvent = startEvent;
    }

    public start(): Promise<void> {
        return Promise.resolve();
    }

    public getReport(): any {
        return {};
    }
}
