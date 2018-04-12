"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../loggers/logger");
const requisition_parser_1 = require("./requisition-parser");
const subscription_reporter_1 = require("../reporters/subscription/subscription-reporter");
class SingleRunRequisitionInput {
    constructor(fileNamePattern) {
        this.executorTimeout = null;
        this.subscriptionReporter = new subscription_reporter_1.SubscriptionReporter({
            type: 'file-name-watcher',
            fileNamePattern: fileNamePattern,
            timeout: 1000
        });
        this.requisitionParser = new requisition_parser_1.RequisitionParser();
    }
    syncDir() {
        return this.subscriptionReporter.connect();
    }
    onNoMoreFilesToBeRead(executorTimeout) {
        this.executorTimeout = executorTimeout;
    }
    receiveRequisition() {
        if (this.executorTimeout)
            this.subscriptionReporter.startTimeout(this.executorTimeout);
        return this.subscriptionReporter
            .receiveMessage()
            .then((unparsed) => {
            try {
                return Promise.resolve(this.requisitionParser.parse(unparsed));
            }
            catch (err) {
                logger_1.Logger.error(`Error parsing requisition ${JSON.stringify(err)}`);
                return Promise.reject(err);
            }
        });
    }
}
exports.SingleRunRequisitionInput = SingleRunRequisitionInput;
