import {StartEventType} from "./start-event-type";
import {Report} from "../../../report/report";
import {StartEvent} from "../../../requisition/start-event/start-event";

export class NullStartEventType implements StartEventType {

    private startEvent: StartEvent;

    public constructor(startEvent: StartEvent)
    {
        this.startEvent = startEvent;
    }

    public start(): Promise<void> {
        return Promise.reject(`No StartEvent type was found: ${JSON.stringify(this, null, 2)}`);
    }

    public getReport(): Report {
        return new Report();
    }
}
