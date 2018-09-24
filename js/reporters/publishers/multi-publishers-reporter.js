"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const publisher_reporter_1 = require("./publisher-reporter");
const logger_1 = require("../../loggers/logger");
class MultiPublishersReporter {
    constructor(publishers = []) {
        logger_1.Logger.debug(`Instantiating publishers`);
        this.publishers = publishers.map((publisher, index) => {
            if (!publisher.name) {
                publisher.name = `Publisher #${index}`;
            }
            return new publisher_reporter_1.PublisherReporter(publisher);
        });
    }
    publish() {
        logger_1.Logger.debug(`Publishing publishers`);
        return Promise.all(this.publishers.map(publisher => publisher.publish()));
    }
    onFinish() {
        //sync forEach
        this.publishers.map(publisher => publisher.onFinish());
    }
    getReport() {
        return this.publishers.map(publisher => publisher.getReport());
    }
}
exports.MultiPublishersReporter = MultiPublishersReporter;
