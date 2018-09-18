"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    unsubscribe() {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.all(this.subscriptionReporters.map(subscription => subscription.unsubscribe()));
        });
    }
    getReport() {
        return this.subscriptionReporters.map(subscription => subscription.getReport());
    }
    onFinish() {
        this.subscriptionReporters.forEach(subscriptionHandler => subscriptionHandler.onFinish());
    }
    haveAllSubscriptionsStoppedWaiting() {
        ++this.subscriptionsStoppedWaitingCounter;
        logger_1.Logger.debug(`Subscription stopped waiting ${this.subscriptionsStoppedWaitingCounter}/${this.subscriptionReporters.length}`);
        return this.subscriptionsStoppedWaitingCounter >= this.subscriptionReporters.length;
    }
}
exports.MultiSubscriptionsReporter = MultiSubscriptionsReporter;
