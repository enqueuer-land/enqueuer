import {StartEvent} from "../../requisition/start-event/start-event";
import {SubscriptionsHandler} from "./subscriptions-handler";
import {StartEventPublisherHandler} from "./start-event-publisher-handler";
import {Publisher} from "../../requisition/start-event/publish/publisher";
import {PublisherFactory} from "../../requisition/start-event/publish/publisher-factory";
import {StartEventType} from "./start-event-type";
import {StartEventTypeFactory} from "./start-event-type-factory";
import {Report} from "../../report/report";

export class StartEventHandler {

    private startEventType: StartEventType;
    private timeout: number = -1;

    constructor(startEvent: StartEvent) {
        this.startEventType = new StartEventTypeFactory().createStartEventType(startEvent);
        this.timeout = startEvent.timeout;
    }

    public start(): Promise<any> {
        return new Promise((resolve, reject) => {

            this.startEventType.start()
                .then(() => {
                    const timer = global.setTimeout(() => {
                            if (timer)
                                global.clearTimeout(timer);
                            console.log("StartEventTimeout")
                            resolve({timeout: this.timeout});
                         }, this.timeout);
                })
                .catch(error => {
                    reject(error)
                });
        });
    }

    public getReport(): any {
        return this.startEventType.getReport();
    }
}