import {StartEventType} from "./start-event-type";
import {NullStartEventType} from "./null-start-event-type";
import {StartEvent} from "../../requisition/start-event/start-event";
import {StartEventPublisherHandler} from "./start-event-publisher-handler";
import {StartEventSubscriptionHandler} from "./start-event-subscription-handler";

export class StartEventTypeFactory {
    public createStartEventType(startEvent: StartEvent): StartEventType {
        if (startEvent.publisher)
            return new StartEventPublisherHandler(startEvent.publisher);
        if (startEvent.subscription)
            return new StartEventSubscriptionHandler(startEvent.subscription);
        return new NullStartEventType(startEvent);
    }
}