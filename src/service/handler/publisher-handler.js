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
var function_executor_1 = require("../../function-executor/function-executor");
var PublisherHandler = /** @class */ (function () {
    function PublisherHandler(publisher) {
        this.report = {};
        this.prePublishingReport = {};
        this.publisher = publisher;
        this.previousPayload = publisher.payload;
    }
    PublisherHandler.prototype.publish = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.generatePayload();
            _this.publisher.execute()
                .then(function (publisher) {
                _this.generateSuccessfulReport(publisher);
                resolve();
            })
                .catch(function (err) {
                _this.generateErrorReport(err);
                reject(err);
            });
        });
    };
    PublisherHandler.prototype.getReport = function () {
        return this.report;
    };
    PublisherHandler.prototype.generateSuccessfulReport = function (publisher) {
        this.report = __assign({}, publisher, { prePublishFunction: this.prePublishingReport, timestamp: new Date() });
        if (this.previousPayload != this.publisher.payload)
            this.report.previousPayload = this.previousPayload;
    };
    PublisherHandler.prototype.generateErrorReport = function (error) {
        this.report = {
            prePublishFunction: this.prePublishingReport,
            errorMessage: error,
            timestamp: new Date()
        };
        if (this.previousPayload != this.publisher.payload)
            this.report.previousPayload = this.previousPayload;
    };
    PublisherHandler.prototype.generatePayload = function () {
        var functionToExecute = this.publisher.createPrePublishingFunction();
        try {
            var publisherExecutor = new function_executor_1.FunctionExecutor(functionToExecute);
            publisherExecutor.execute();
            this.prePublishingReport = {
                tests: {
                    failing: publisherExecutor.getFailingTests(),
                    passing: publisherExecutor.getPassingTests(),
                    exception: publisherExecutor.getException()
                },
                reports: publisherExecutor.getReports()
            };
            this.previousPayload = this.publisher.payload;
            this.publisher.payload = publisherExecutor.getFunctionResponse().payload;
        }
        catch (exc) {
            this.prePublishingReport = {
                onMessageReceivedFunctionCreationException: exc
            };
        }
    };
    return PublisherHandler;
}());
exports.PublisherHandler = PublisherHandler;
