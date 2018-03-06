import {StartEvent} from "./start-event";
import {SubscriptionHandler} from "../subscription/subscription-handler";

export class StartEventSubscriptionHandler implements StartEvent {

    private subscriptionHandler: SubscriptionHandler;

    public constructor(subscriptionAttributes: any) {
        this.subscriptionHandler = new SubscriptionHandler(subscriptionAttributes);
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
        return this.generateReport();
    }

    private generateReport(): any {
        const subscriptionReport = this.subscriptionHandler.getReport();
        subscriptionReport.valid = subscriptionReport &&
                                    subscriptionReport.functionReport &&
                                    subscriptionReport.functionReport.failingTests.length <= 0;
        return subscriptionReport;
    }


}