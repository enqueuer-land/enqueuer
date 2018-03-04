import {StartEventType} from "./start-event-type";
import {NullStartEventType} from "./null-start-event-type";
import {StartEvent} from "../../requisition/start-event/start-event";
import {StartEventPublisherHandler} from "./start-event-publisher-handler";

export class StartEventTypeFactory {
    createStartEventType(startEvent: StartEvent): StartEventType {
        if (startEvent.publisher)
            return new StartEventPublisherHandler(startEvent.publisher);
        return new NullStartEventType(startEvent);
    }
}