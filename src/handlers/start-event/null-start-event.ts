import {Injectable} from "../../injector/injector";
import {NullFactoryFunction} from "../../injector/factory-function";
import {StartEvent} from "../../start-events/start-event";

@Injectable(NullFactoryFunction)
export class NullStartEvent extends StartEvent {

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
