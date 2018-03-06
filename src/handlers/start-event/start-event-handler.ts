import {StartEvent} from "../../start-event/start-event";
import {StartEventFactory} from "../../start-event/start-event-factory";

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