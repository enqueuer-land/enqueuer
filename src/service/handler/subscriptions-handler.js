"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var subscription_report_1 = require("../subscription-report");
var subscription_factory_1 = require("../requisition/subscription/subscription-factory");
var SubscriptionsHandler = /** @class */ (function () {
    function SubscriptionsHandler(subscriptionsAttributes) {
        this.subscriptionsReport = [];
        this.subscriptionsCompletedCounter = 0;
        this.subscriptionsReceivedMessagesCounter = 0;
        var subscriptionFactory = new subscription_factory_1.SubscriptionFactory();
        for (var id = 0; id < subscriptionsAttributes.length; ++id) {
            var subscription = subscriptionFactory.createSubscription(subscriptionsAttributes[id]);
            if (subscription)
                this.subscriptionsReport.push(new subscription_report_1.SubscriptionReport(subscription, id));
        }
        this.onSubscriptionsCompletedCallback = function () { };
        this.onAllSubscriptionsReceivedMessagesCallback = function () { };
    }
    SubscriptionsHandler.prototype.start = function (onSubscriptionsCompleted, onAllSubscriptionsReceivedMessagesCallback) {
        var _this = this;
        this.onSubscriptionsCompletedCallback = onSubscriptionsCompleted;
        this.onAllSubscriptionsReceivedMessagesCallback = onAllSubscriptionsReceivedMessagesCallback;
        this.subscriptionsReport.forEach(function (subscriptionsReport) {
            return subscriptionsReport
                .start(function (subscription) { return _this.onSubscriptionCompleted(subscription); }, function (subscription) { return _this.onMessageReceived(subscription); });
        });
    };
    SubscriptionsHandler.prototype.unsubscribe = function () {
        this.subscriptionsReport.forEach(function (subscriptionsReport) { return subscriptionsReport.unsubscribe(); });
    };
    SubscriptionsHandler.prototype.getReports = function () {
        var reports = [];
        this.subscriptionsReport.forEach(function (subscriptionsReport) { return reports.push(subscriptionsReport.getReport()); });
        return reports;
    };
    //TODO: verify id
    SubscriptionsHandler.prototype.onSubscriptionCompleted = function (subscriptionId) {
        ++this.subscriptionsCompletedCounter;
        if (this.subscriptionsCompletedCounter == this.subscriptionsReport.length)
            this.onSubscriptionsCompletedCallback(null);
    };
    //TODO: verify id
    SubscriptionsHandler.prototype.onMessageReceived = function (subscriptionId) {
        ++this.subscriptionsReceivedMessagesCounter;
        //Pay attention, at least one message received per subscription
        if (this.subscriptionsReceivedMessagesCounter >= this.subscriptionsReport.length)
            this.onAllSubscriptionsReceivedMessagesCallback(null);
    };
    return SubscriptionsHandler;
}());
exports.SubscriptionsHandler = SubscriptionsHandler;
