"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const subscription_reporter_1 = require("./subscription-reporter");
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
            if (this.subscriptionReporters.length <= 0) {
                return resolve();
            }
            this.subscriptionReporters.forEach(subscriptionHandler => {
                subscriptionHandler.startTimeout(() => {
                    if (this.haveAllSubscriptionsStoppedWaiting()) {
                        resolve();
                    }
                });
                subscriptionHandler.receiveMessage()
                    .then(() => {
                    if (this.haveAllSubscriptionsStoppedWaiting()) {
                        resolve();
                    }
                })
                    .catch(err => reject(err));
            });
        });
    }
    getReport() {
        return this.subscriptionReporters.map(subscription => subscription.getReport());
    }
    haveAllSubscriptionsStoppedWaiting() {
        ++this.subscriptionsStoppedWaitingCounter;
        return (this.subscriptionsStoppedWaitingCounter >= this.subscriptionReporters.length);
    }
}
exports.MultiSubscriptionsReporter = MultiSubscriptionsReporter;
