import {StartEvent} from "./start-event";
import {Report} from "../../report/report";
import {SubscriptionHandler} from "../subscription/subscription-handler";
import {SubscriptionFactory} from "../../subscription/subscription-factory";

export class StartEventSubscriptionHandler implements StartEvent {

    private subscriptionHandler: SubscriptionHandler;
    private report: any = {};

    public constructor(subscriptionAttributes: any) {
        const subscriptionFactory: SubscriptionFactory = new SubscriptionFactory();
        this.subscriptionHandler = new SubscriptionHandler(subscriptionFactory.createSubscription(subscriptionAttributes));
    }

    public start(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.subscriptionHandler.connect()
                .then(() => {
                    this.subscriptionHandler.onTimeout(() => resolve());
                    this.subscriptionHandler.receiveMessage()
                        .then(() => resolve())
                        .catch(err => reject(err));
                })
                .catch(err => reject(err));
        });
    }

    public getReport(): Report {
        this.generateReport();
        return this.report;
    }

    private generateReport(): any {
        const subscriptionReport = this.subscriptionHandler.getReport();
        if (subscriptionReport) {
            this.report = subscriptionReport;
        }
        this.report.valid = subscriptionReport &&
                            subscriptionReport.functionReport &&
                            subscriptionReport.functionReport.failingTests.length <= 0;
    }


}