import {StartEvent} from "../../start-events/start-event";
import {StartEventFactory} from "../../start-events/start-event-factory";

export class StartEventHandler {

    private startEvent: StartEvent;

    constructor(startEvent: any) {
        this.startEvent = new StartEventFactory().createStartEvent(startEvent);
    }

    public start(): Promise<any> {
        return this.startEvent.start();
    }

    public getReport(): any {
        return this.startEvent.getReport();
    }
}