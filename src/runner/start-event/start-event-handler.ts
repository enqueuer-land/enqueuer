import {StartEvent} from "./start-event";
import {StartEventFactory} from "./start-event-factory";

export class StartEventHandler {

    private startEventType: StartEvent;

    constructor(startEvent: StartEvent) {
        this.startEventType = new StartEventFactory().createStartEvent(startEvent);
    }

    public start(): Promise<any> {
        return this.startEventType.start();
    }

    public getReport(): any {
        return this.startEventType.getReport();
    }
}