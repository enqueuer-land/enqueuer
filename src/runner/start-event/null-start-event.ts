import {Report} from "../../report/report";
import {StartEvent} from "./start-event";

export class NullStartEvent implements StartEvent {

    private startEvent: StartEvent;

    public constructor(startEvent: StartEvent)
    {
        this.startEvent = startEvent;
    }

    public start(): Promise<void> {
        return Promise.reject(`No StartEvent type was found: ${JSON.stringify(this, null, 2)}`);
    }

    public getReport(): any {
        return `No StartEvent type was found: ${JSON.stringify(this, null, 2)}`;
    }
}
