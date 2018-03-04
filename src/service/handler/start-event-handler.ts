import {StartEvent} from "../../requisition/start-event/start-event";
import {MultiSubscriptionsHandler} from "./multi-subscriptions-handler";
import {StartEventPublisherHandler} from "./start-event-publisher-handler";
import {Publisher} from "../../requisition/start-event/publish/publisher";
import {PublisherFactory} from "../../requisition/start-event/publish/publisher-factory";
import {StartEventType} from "./start-event-type";
import {StartEventTypeFactory} from "./start-event-type-factory";
import {Report} from "../../report/report";

export class StartEventHandler {

    private startEventType: StartEventType;

    constructor(startEvent: StartEvent) {
        this.startEventType = new StartEventTypeFactory().createStartEventType(startEvent);
    }

    public start(): Promise<any> {
        return this.startEventType.start();
    }

    public getReport(): any {
        return this.startEventType.getReport();
    }
}