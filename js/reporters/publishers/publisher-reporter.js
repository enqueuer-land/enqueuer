"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const publisher_1 = require("../../publishers/publisher");
const date_controller_1 = require("../../timers/date-controller");
const logger_1 = require("../../loggers/logger");
const conditional_injector_1 = require("conditional-injector");
const report_model_1 = require("../../models/outputs/report-model");
const on_message_received_event_executor_1 = require("../../events/on-message-received-event-executor");
const on_init_event_executor_1 = require("../../events/on-init-event-executor");
const on_finish_event_executor_1 = require("../../events/on-finish-event-executor");
class PublisherReporter {
    constructor(publisher) {
        this.report = {
            name: publisher.name,
            valid: true,
            type: publisher.type,
            tests: []
        };
        this.executeOnInitFunction(publisher);
        logger_1.Logger.debug(`Instantiating publisher from '${publisher.type}'`);
        this.publisher = conditional_injector_1.Container.subclassesOf(publisher_1.Publisher).create(publisher);
    }
    publish() {
        logger_1.Logger.trace(`Publishing ${this.report.name}`);
        return new Promise((resolve, reject) => {
            this.publisher.publish()
                .then(() => {
                logger_1.Logger.debug(`${this.report.name} published`);
                this.report.publishTime = new date_controller_1.DateController().toString();
                this.report.tests.push({ name: 'Published', valid: true, description: 'Published successfully' });
                this.executeOnMessageReceivedFunction();
                resolve();
            })
                .catch((err) => {
                logger_1.Logger.error(err);
                this.report.tests.push({ name: 'Published', valid: false, description: err.toString() });
                reject(err);
            });
        });
    }
    getReport() {
        this.pushResponseMessageReceivedTest();
        this.report.valid = this.report.valid && report_model_1.checkValidation(this.report);
        return this.report;
    }
    onFinish() {
        this.report.tests = this.report.tests.concat(new on_finish_event_executor_1.OnFinishEventExecutor('publisher', this.publisher).trigger());
    }
    pushResponseMessageReceivedTest() {
        this.report.messageReceived = this.publisher.messageReceived;
        if (this.publisher.onMessageReceived && this.publisher.onMessageReceived.assertions) {
            let responseTest = {
                name: 'Response message received',
                valid: false,
                description: 'No response message was received'
            };
            if (this.publisher.messageReceived) {
                responseTest.valid = true;
                responseTest.description = 'Response message was received';
            }
            this.report.tests.push(responseTest);
        }
    }
    executeOnMessageReceivedFunction() {
        this.report.tests = this.report.tests.concat(new on_message_received_event_executor_1.OnMessageReceivedEventExecutor('publisher', this.publisher).trigger());
    }
    executeOnInitFunction(publisher) {
        this.report.tests = this.report.tests.concat(new on_init_event_executor_1.OnInitEventExecutor('publisher', publisher).trigger());
    }
}
exports.PublisherReporter = PublisherReporter;
