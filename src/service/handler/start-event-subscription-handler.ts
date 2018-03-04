import {StartEventType} from "./start-event-type";
import {Report} from "../../report/report";
import {Subscription} from "../../requisition/subscription/subscription";
import {SubscriptionsHandler} from "./subscriptions-handler";

export class StartEventSubscriptionHandler implements StartEventType{

    private subscriptionHandler: SubscriptionsHandler;
    private report: any = {};

    public constructor(subscription: Subscription) {
        this.subscriptionHandler = new SubscriptionsHandler([subscription]);
    }

    public start(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.subscriptionHandler.start(
                () => {},
                () =>
                {
                    this.generateReport();
                    resolve();
                }
            );
        });

    }

    public getReport(): Report {
        return this.report;
    }

    private generateReport(): any {
        const subscriptionReport = this.subscriptionHandler.getReport()[0];
        this.report = subscriptionReport;
        this.report.valid = subscriptionReport.onMessageReceived.tests.failing.length <= 0;
    }


}