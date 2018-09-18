"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../../loggers/logger");
const file_publisher_1 = require("../../publishers/file-publisher");
class FileResultCreator {
    constructor(filename) {
        this.report = {
            name: filename,
            tests: [],
            valid: true,
            requisitions: []
        };
    }
    addTestSuite(name, report) {
        report.name = name;
        this.report.requisitions.push(report);
        this.report.valid = this.report.valid && report.valid;
    }
    addError(err) {
        this.report.tests.push({
            description: err,
            valid: false,
            name: 'Requisition ran'
        });
        this.report.valid = false;
    }
    isValid() {
        return this.report.valid;
    }
    create() {
        const filePublisherAttributes = {
            type: 'file',
            name: this.report.name,
            pretty: true,
            filename: this.report.name
        };
        const filePublisher = new file_publisher_1.FilePublisher(filePublisherAttributes);
        filePublisher.payload = this.report;
        filePublisher.publish()
            .then(() => {
            logger_1.Logger.debug(`Single-run report file created`);
        })
            .catch(err => {
            logger_1.Logger.warning(`Error generating report: ${err}`);
        });
    }
}
exports.FileResultCreator = FileResultCreator;
