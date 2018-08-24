"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const subscription_reporter_1 = require("./subscription-reporter");
const logger_1 = require("../../loggers/logger");
class MultiSubscriptionsReporter {
    constructor(subscriptionsAttributes) {
        this.subscriptionReporters = [];
        this.subscriptionsStoppedWaitingCounter = 0;
        if (subscriptionsAttributes) {
            this.subscriptionReporters = subscriptionsAttributes.map((subscription, index) => {
                if (!subscription.name) {
                    subscription.name = `Subscription #${index}`;
                }
                return new subscription_reporter_1.SubscriptionReporter(subscription);
            });
        }
    }
    subscribe(stoppedWaitingCallback) {
        return Promise.all(this.subscriptionReporters.map(subscriptionHandler => {
            subscriptionHandler.startTimeout(() => {
                if (this.haveAllSubscriptionsStoppedWaiting()) {
                    logger_1.Logger.debug(`All pre-subscribed subscriptions stopped waiting`);
                    return Promise.resolve(stoppedWaitingCallback());
                }
            });
            return subscriptionHandler.subscribe();
        }));
    }
    receiveMessage() {
        return new Promise((resolve, reject) => {
            if (this.subscriptionReporters.length <= 0) {
                return resolve();
            }
            this.subscriptionReporters.forEach(subscriptionHandler => {
                subscriptionHandler.receiveMessage()
                    .then(() => {
                    if (this.haveAllSubscriptionsStoppedWaiting()) {
                        logger_1.Logger.debug(`All up-to-receive subscriptions stopped waiting`);
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
        logger_1.Logger.debug(`Subscription stopped waiting ${this.subscriptionsStoppedWaitingCounter}/${this.subscriptionReporters.length}`);
        if (this.subscriptionsStoppedWaitingCounter >= this.subscriptionReporters.length) {
            return true;
        }
        return false;
    }
}
exports.MultiSubscriptionsReporter = MultiSubscriptionsReporter;
