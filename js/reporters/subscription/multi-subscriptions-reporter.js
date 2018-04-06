"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const subscription_reporter_1 = require("./subscription-reporter");
class MultiSubscriptionsReporter {
    constructor(subscriptionsAttributes) {
        this.subscriptionHandlers = [];
        this.subscriptionsConnectionCompletedCounter = 0;
        this.subscriptionsStoppedWaitingCounter = 0;
        for (let id = 0; id < subscriptionsAttributes.length; ++id) {
            this.subscriptionHandlers.push(new subscription_reporter_1.SubscriptionReporter(subscriptionsAttributes[id]));
        }
    }
    connect() {
        return new Promise((resolve, reject) => {
            this.subscriptionHandlers.forEach(subscriptionHandler => {
                subscriptionHandler.connect()
                    .then(() => {
                    if (this.areAllSubscriptionsConnected())
                        resolve();
                })
                    .catch(err => reject(err));
            });
        });
    }
    receiveMessage() {
        return new Promise((resolve, reject) => {
            this.subscriptionHandlers.forEach(subscriptionHandler => {
                subscriptionHandler.onTimeout(() => {
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
        let errorsDescription = [];
        let valid = true;
        for (let i = 0; i < this.subscriptionHandlers.length; ++i) {
            const subscriptionHandler = this.subscriptionHandlers[i];
            const subscriptionReport = subscriptionHandler.getReport();
            subscriptionReports.push(subscriptionReport);
            for (let j = 0; subscriptionReport.errorsDescription && j < subscriptionReport.errorsDescription.length; ++j) {
                errorsDescription.push(`[${j}] ` + subscriptionReport.errorsDescription[j]);
            }
            valid = valid && subscriptionReport.valid;
        }
        ;
        return {
            subscriptions: subscriptionReports,
            valid: valid,
            errorsDescription: errorsDescription
        };
    }
    areAllSubscriptionsConnected() {
        ++this.subscriptionsConnectionCompletedCounter;
        return (this.subscriptionsConnectionCompletedCounter >= this.subscriptionHandlers.length);
    }
    haveAllSubscriptionsStoppedWaiting() {
        ++this.subscriptionsStoppedWaitingCounter;
        return (this.subscriptionsStoppedWaitingCounter >= this.subscriptionHandlers.length);
    }
}
exports.MultiSubscriptionsReporter = MultiSubscriptionsReporter;
