"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const publisher_1 = require("./publisher");
const logger_1 = require("../loggers/logger");
const container_1 = require("../injector/container");
class MultiPublisher {
    constructor(reportersAttributes) {
        this.repliers = [];
        reportersAttributes.forEach((report) => {
            logger_1.Logger.debug(`Instantiating publisher ${report.type}`);
            const publisher = container_1.Container.get(publisher_1.Publisher).createFromPredicate(report);
            this.repliers.push(publisher);
        });
    }
    publish(payload) {
        return Promise.all(this.repliers.map(reporter => {
            reporter.payload = payload;
            return reporter.publish();
        }));
    }
}
exports.MultiPublisher = MultiPublisher;
