import {StartEventType} from "./start-event-type";
import {Report} from "../../report/report";
import {Subscription} from "../../requisition/subscription/subscription";
import {SubscriptionHandler} from "./subscription-handler";
import {SubscriptionFactory} from "../../requisition/subscription/subscription-factory";

export class StartEventSubscriptionHandler implements StartEventType {

    private subscriptionHandler: SubscriptionHandler;
    private report: any = {};
    private additionalReportInfo: any;

    public constructor(subscriptionAttributes: Subscription) {
        const subscriptionFactory: SubscriptionFactory = new SubscriptionFactory();
        this.subscriptionHandler = new SubscriptionHandler(subscriptionFactory.createSubscription(subscriptionAttributes));
    }

    public start(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.subscriptionHandler.start(
                () => {},
                (additionalReportInfo: any = null) => {
                    this.additionalReportInfo = additionalReportInfo;
                    resolve();
                }
            );
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
                            subscriptionReport.functionReport.tests.failing.length <= 0;
        if (this.additionalReportInfo)
            this.report = {
                ...this.report,
                additionalInfo: this.additionalReportInfo
            }
    }


}