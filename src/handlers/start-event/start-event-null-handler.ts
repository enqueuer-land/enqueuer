import {Injectable} from "../../injector/injector";
import {NullFactoryPredicate} from "../../injector/factory-predicate";
import {StartEvent} from "../../start-events/start-event";

@Injectable(NullFactoryPredicate)
export class StartEventNullHandler extends StartEvent {

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
