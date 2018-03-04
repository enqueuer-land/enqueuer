import {NullStartEvent} from "./null-start-event";
import {StartEventPublisherHandler} from "./start-event-publisher-handler";
import {StartEventSubscriptionHandler} from "./start-event-subscription-handler";
import {StartEvent} from "./start-event";

export class StartEventFactory {
    public createStartEvent(startEventAttributes: any): StartEvent {
        if (startEventAttributes.publisher)
            return new StartEventPublisherHandler(startEventAttributes.publisher);
        if (startEventAttributes.subscription)
            return new StartEventSubscriptionHandler(startEventAttributes.subscription);
        return new NullStartEvent(startEventAttributes);
    }
}