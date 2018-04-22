"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const subscription_reporter_1 = require("./subscription-reporter");
const report_merger_1 = require("../../reports/report-merger");
class MultiSubscriptionsReporter {
    constructor(subscriptionsAttributes) {
        this.subscriptionReporters = [];
        this.subscriptionsStoppedWaitingCounter = 0;
        for (let id = 0; id < subscriptionsAttributes.length; ++id) {
            this.subscriptionReporters.push(new subscription_reporter_1.SubscriptionReporter(subscriptionsAttributes[id]));
        }
    }
    connect() {
        return Promise.all(this.subscriptionReporters.map(subscriptionHandler => subscriptionHandler.connect()));
    }
    receiveMessage() {
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
                    .catch(err => reject(err));
            });
        });
    }
    getReport() {
        let subscriptionReports = [];
        const reportMerger = new report_merger_1.ReportMerger("Subscriptions");
        for (let i = 0; i < this.subscriptionReporters.length; ++i) {
            const subscriptionReport = this.subscriptionReporters[i].getReport();
            subscriptionReports.push(subscriptionReports);
            reportMerger.addReport(subscriptionReport);
        }
        ;
        return Object.assign({}, reportMerger.getReport());
    }
    haveAllSubscriptionsStoppedWaiting() {
        ++this.subscriptionsStoppedWaitingCounter;
        return (this.subscriptionsStoppedWaitingCounter >= this.subscriptionReporters.length);
    }
}
exports.MultiSubscriptionsReporter = MultiSubscriptionsReporter;
