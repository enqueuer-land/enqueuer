"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var function_executor_1 = require("../function-executor/function-executor");
var SubscriptionReport = /** @class */ (function () {
    function SubscriptionReport(subscription, id) {
        this.subscriptionReport = null;
        this.subscription = subscription;
        this.onMessageReceivedCallback = function () { };
        this.id = id;
        this.subscriptionReport = __assign({}, subscription);
    }
    SubscriptionReport.prototype.start = function (onSubscriptionCompleted, onMessageReceivedCallback) {
        var _this = this;
        this.onMessageReceivedCallback = onMessageReceivedCallback;
        this.subscription.subscribe(function (subscription) { return _this.onMessageReceived(subscription); }, function (subscription) { return onSubscriptionCompleted(_this.id); });
    };
    SubscriptionReport.prototype.unsubscribe = function () {
        this.subscription.unsubscribe();
    };
    SubscriptionReport.prototype.onMessageReceived = function (subscription) {
        var onMessageReceived = {};
        var functionToExecute = subscription.createOnMessageReceivedFunction();
        if (functionToExecute) {
            try {
                var subscriptionTestExecutor = new function_executor_1.FunctionExecutor(functionToExecute, subscription.message);
                subscriptionTestExecutor.execute();
                onMessageReceived = {
                    tests: {
                        failing: subscriptionTestExecutor.getFailingTests(),
                        passing: subscriptionTestExecutor.getPassingTests(),
                        onMessageReceivedExecutionException: subscriptionTestExecutor.getException()
                    },
                    reports: subscriptionTestExecutor.getReports()
                };
            }
            catch (exc) {
                onMessageReceived = {
                    exception: exc
                };
            }
        }
        this.subscriptionReport = __assign({}, subscription, { timestamp: new Date(), onMessageReceived: onMessageReceived });
        this.onMessageReceivedCallback(this.id);
    };
    SubscriptionReport.prototype.getReport = function () {
        return this.subscriptionReport;
    };
    return SubscriptionReport;
}());
exports.SubscriptionReport = SubscriptionReport;
