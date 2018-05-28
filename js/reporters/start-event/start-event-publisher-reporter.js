"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const publisher_1 = require("../../publishers/publisher");
const start_event_reporter_1 = require("./start-event-reporter");
const pre_publish_meta_function_body_1 = require("../../meta-functions/pre-publish-meta-function-body");
const meta_function_executor_1 = require("../../meta-functions/meta-function-executor");
const date_controller_1 = require("../../timers/date-controller");
const logger_1 = require("../../loggers/logger");
const conditional_injector_1 = require("conditional-injector");
const report_compositor_1 = require("../../reports/report-compositor");
const on_message_received_reporter_1 = require("../../meta-functions/on-message-received-reporter");
let StartEventPublisherReporter = class StartEventPublisherReporter extends start_event_reporter_1.StartEventReporter {
    constructor(startEvent) {
        super();
        this.prePublishingFunctionReport = {};
        this.publisherOriginalAttributes = startEvent.publisher;
        this.reportCompositor = new report_compositor_1.ReportCompositor(this.publisherOriginalAttributes.name);
    }
    start() {
        logger_1.Logger.trace(`Firing publication as startEvent`);
        return new Promise((resolve, reject) => {
            this.executePrePublishingFunction();
            if (this.publisher) {
                this.reportCompositor.addInfo({
                    publishTime: new date_controller_1.DateController().toString(),
                });
                this.publisher.publish()
                    .then(() => {
                    this.executeOnMessageReceivedFunction();
                    return resolve();
                })
                    .catch((err) => {
                    logger_1.Logger.error(err);
                    this.reportCompositor.addTest(`Error publishing start event '${this.publisher}'`, false);
                    reject(err);
                });
            }
            else {
                const message = `Publisher is undefined after prePublish function execution '${this.publisher}'`;
                this.reportCompositor.addTest(message, false);
                reject(message);
            }
        });
    }
    getReport() {
        this.reportCompositor.addInfo({
            prePublishingFunctionReport: this.prePublishingFunctionReport
        });
        if (this.publisher)
            this.reportCompositor.addInfo({ type: this.publisher.type });
        return this.reportCompositor.snapshot();
    }
    executeOnMessageReceivedFunction() {
        if (!this.publisher || !this.publisher.messageReceived || !this.publisher.onMessageReceived)
            return;
        const onMessageReceivedReporter = new on_message_received_reporter_1.OnMessageReceivedReporter(this.publisher.messageReceived, this.publisher.onMessageReceived);
        const functionResponse = onMessageReceivedReporter.execute();
        functionResponse.tests
            .map((test) => this.reportCompositor.addTest(test.name, test.valid));
        this.reportCompositor.addInfo({
            onMessageFunctionReport: functionResponse,
            messageReceivedTimestamp: new date_controller_1.DateController().toString()
        });
    }
    executePrePublishingFunction() {
        const prePublishFunction = new pre_publish_meta_function_body_1.PrePublishMetaFunctionBody(this.publisherOriginalAttributes);
        const functionResponse = new meta_function_executor_1.MetaFunctionExecutor(prePublishFunction).execute();
        if (functionResponse.publisher.payload)
            functionResponse.publisher.payload = JSON.stringify(functionResponse.publisher.payload);
        logger_1.Logger.trace(`Instantiating requisition publisher from '${functionResponse.publisher.type}'`);
        this.publisher = conditional_injector_1.Container.subclassesOf(publisher_1.Publisher).create(functionResponse.publisher);
        this.prePublishingFunctionReport = functionResponse;
        functionResponse.tests.map((test) => this.reportCompositor.addTest(test.name, test.valid));
        if (functionResponse.exception) {
            this.reportCompositor.addTest(functionResponse.exception, false);
        }
    }
};
StartEventPublisherReporter = __decorate([
    conditional_injector_1.Injectable({ predicate: (startEvent) => startEvent.publisher != null }),
    __metadata("design:paramtypes", [Object])
], StartEventPublisherReporter);
exports.StartEventPublisherReporter = StartEventPublisherReporter;
