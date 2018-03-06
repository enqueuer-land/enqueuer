import {StartEvent} from "../../start-event/start-event";

export class NullStartEvent implements StartEvent {

    private startEvent: any;

    public constructor(startEvent: any)
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
