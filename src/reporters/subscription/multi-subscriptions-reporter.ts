import {SubscriptionModel} from "../../models/subscription-model";
import {Report} from "../../reports/report";
import {Reporter} from "../reporter";
import {SubscriptionReporter} from "./subscription-reporter";
import {ReportMerger} from "../../reports/report-merger";

export class MultiSubscriptionsReporter implements Reporter {
    private subscriptionReporters: SubscriptionReporter[] = [];
    private subscriptionsStoppedWaitingCounter: number = 0;

    constructor(subscriptionsAttributes: SubscriptionModel[]) {
        for (let id: number = 0; id < subscriptionsAttributes.length; ++id) {
            this.subscriptionReporters.push(new SubscriptionReporter(subscriptionsAttributes[id]));
        }
    }

    public connect(): Promise<void[]> {
        return Promise.all(this.subscriptionReporters.map(
            subscriptionHandler => subscriptionHandler.connect()
            ));
    }

    public receiveMessage(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.subscriptionReporters.forEach(subscriptionHandler => {
                subscriptionHandler.startTimeout(() => {
                    if (this.haveAllSubscriptionsStoppedWaiting())
                        resolve();
                });
                subscriptionHandler.receiveMessage()
                    .then(() => {
                        if (this.haveAllSubscriptionsStoppedWaiting())
                            resolve();
                    })
                    .catch(err => reject(err))
            }
            );
        });
    }

    public getReport(): Report {
        let subscriptionReports: any = [];
        const reportMerger = new ReportMerger("Subscriptions");

        for (let i = 0; i < this.subscriptionReporters.length; ++i) {
            const subscriptionReport = this.subscriptionReporters[i].getReport();
            subscriptionReports.push(subscriptionReports);
            reportMerger.addReport(subscriptionReport);
        };
        return {
            ...reportMerger.getReport()
        };
    }

    private haveAllSubscriptionsStoppedWaiting() {
        ++this.subscriptionsStoppedWaitingCounter;
        return (this.subscriptionsStoppedWaitingCounter >= this.subscriptionReporters.length);
    }

}