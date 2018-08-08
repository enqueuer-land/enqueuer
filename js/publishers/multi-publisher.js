"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const publisher_1 = require("./publisher");
const logger_1 = require("../loggers/logger");
const conditional_injector_1 = require("conditional-injector");
class MultiPublisher {
    constructor(reportersAttributes) {
        this.publishers = [];
        reportersAttributes.forEach((report) => {
            logger_1.Logger.debug(`Instantiating publisher ${report.type}`);
            const publisher = conditional_injector_1.Container.subclassesOf(publisher_1.Publisher).create(report);
            this.publishers.push(publisher);
        });
    }
    publish(payload) {
        return Promise.all(this.publishers.map(publisher => {
            publisher.payload = payload;
            return publisher.publish();
        }));
    }
}
exports.MultiPublisher = MultiPublisher;
