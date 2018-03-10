import {StartEvent} from "../../start-events/start-event";
import {SubscriptionHandler} from "../subscription/subscription-handler";
import {Injectable} from "../../injector/injector";

@Injectable((startEvent: any) => {
    return startEvent.subscription != null;
})
export class StartEventSubscriptionHandler extends StartEvent {

    private subscriptionHandler: SubscriptionHandler;

    public constructor(startEvent: any) {
        super();
        this.subscriptionHandler = new SubscriptionHandler(startEvent.subscription);
    }

    public start(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.subscriptionHandler.connect()
                .then(() => {
                    this.subscriptionHandler
                        .onTimeout(() => resolve());
                    this.subscriptionHandler.receiveMessage()
                        .then(() => resolve())
                        .catch(err => reject(err));
                })
                .catch(err => reject(err));
        });
    }

    public getReport(): any {
        return this.subscriptionHandler.getReport();
    }
}