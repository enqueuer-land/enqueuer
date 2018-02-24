"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SubscriptionOnMessageReceivedExecutor = /** @class */ (function () {
    function SubscriptionOnMessageReceivedExecutor(subscription, startEvent, message) {
        this.passingTests = [];
        this.failingTests = [];
        this.reports = {};
        this.warning = "";
        this.subscriptionFunction = null;
        this.subscriptionFunction = subscription.createOnMessageReceivedFunction();
        this.startEvent = startEvent;
        this.message = message;
    }
    SubscriptionOnMessageReceivedExecutor.prototype.execute = function () {
        if (this.subscriptionFunction == null)
            return;
        try {
            var functionResponse = this.subscriptionFunction(this.message, this.startEvent);
            for (var test_1 in functionResponse.test) {
                if (functionResponse[test_1]) {
                    this.passingTests.push(test_1);
                }
                else {
                    this.failingTests.push(test_1);
                }
            }
            for (var report in functionResponse.report) {
                this.reports[report] = functionResponse.report[report];
            }
        }
        catch (exc) {
            this.warning = exc;
        }
    };
    SubscriptionOnMessageReceivedExecutor.prototype.getPassingTests = function () {
        return this.passingTests;
    };
    SubscriptionOnMessageReceivedExecutor.prototype.getFailingTests = function () {
        return this.failingTests;
    };
    SubscriptionOnMessageReceivedExecutor.prototype.getReports = function () {
        return this.reports;
    };
    SubscriptionOnMessageReceivedExecutor.prototype.getWarning = function () {
        return this.warning;
    };
    return SubscriptionOnMessageReceivedExecutor;
}());
exports.SubscriptionOnMessageReceivedExecutor = SubscriptionOnMessageReceivedExecutor;
