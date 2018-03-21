import {StartEventReporter} from "./start-event-reporter";
import {SubscriptionHandler} from "../subscription/subscription-handler";
import {Injectable} from "../../injector/injector";
import {SubscriptionModel} from "../../requisitions/models/subscription-model";
import {Report} from "../report";

@Injectable((startEvent: any) => {
    return startEvent.subscription != null;
})
export class StartEventSubscriptionReporter extends StartEventReporter {

    private subscriptionHandler: SubscriptionHandler;

    public constructor(startEvent: SubscriptionModel) {
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

    public getReport(): Report {
        return this.subscriptionHandler.getReport();
    }
}