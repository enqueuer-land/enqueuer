import {Injectable} from "../../injector/injector";
import {NullFactoryPredicate} from "../../injector/factory-predicate";
import {StartEventReporter} from "./start-event-reporter";

@Injectable(NullFactoryPredicate)
export class StartEventNullReporter extends StartEventReporter {

    private startEvent: any;

    public constructor(startEvent: any)
    {
        super();
        this.startEvent = startEvent;
    }

    public start(): Promise<void> {
        return Promise.reject(`No StartEvent type was found: ${JSON.stringify(this, null, 2)}`);
    }

    public getReport(): any {
        return `No StartEvent type was found: ${JSON.stringify(this, null, 2)}`;
    }
}
