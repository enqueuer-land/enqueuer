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
const pre_publish_meta_function_1 = require("../../meta-functions/pre-publish-meta-function");
const meta_function_executor_1 = require("../../meta-functions/meta-function-executor");
const date_controller_1 = require("../../timers/date-controller");
const logger_1 = require("../../loggers/logger");
const conditional_injector_1 = require("conditional-injector");
let StartEventPublisherReporter = class StartEventPublisherReporter extends start_event_reporter_1.StartEventReporter {
    constructor(startEvent) {
        super();
        this.prePublishingFunctionReport = {};
        this.publisherOriginalAttributes = startEvent.publisher;
        this.report = {
            valid: false,
            name: this.publisherOriginalAttributes.name,
            errorsDescription: []
        };
    }
    start() {
        logger_1.Logger.trace(`Firing publication as startEvent`);
        return new Promise((resolve, reject) => {
            this.executePrePublishingFunction();
            if (this.publisher) {
                this.publisher.publish()
                    .then(() => {
                    return resolve();
                })
                    .catch((err) => {
                    logger_1.Logger.error(err);
                    if (this.report.errorsDescription)
                        this.report.errorsDescription.push(`Error publishing start event '${this.publisher}'`);
                    reject(err);
                });
            }
            else {
                const message = `Publisher is undefined after prePublish function execution '${this.publisher}'`;
                if (this.report.errorsDescription)
                    this.report.errorsDescription.push(message);
                reject(message);
            }
        });
    }
    getReport() {
        let publisherName = this.publisherOriginalAttributes.name;
        if (this.publisher && this.publisher.name)
            publisherName = this.publisher.name;
        this.report = {
            prePublishingFunctionReport: this.prePublishingFunctionReport,
            name: publisherName,
            timestamp: new date_controller_1.DateController().toString(),
            valid: (this.report.errorsDescription && this.report.errorsDescription.length <= 0) || false,
            errorsDescription: this.report.errorsDescription
        };
        if (this.publisher)
            this.report.type = this.publisher.type;
        if (this.publisherOriginalAttributes.name)
            this.report.name = this.publisherOriginalAttributes.name;
        return this.report;
    }
    executePrePublishingFunction() {
        const prePublishFunction = new pre_publish_meta_function_1.PrePublishMetaFunction(this.publisherOriginalAttributes);
        const functionResponse = new meta_function_executor_1.MetaFunctionExecutor(prePublishFunction).execute();
        if (functionResponse.publisher.payload)
            functionResponse.publisher.payload = JSON.stringify(functionResponse.publisher.payload);
        logger_1.Logger.trace(`Instantiating requisition publisher from '${functionResponse.publisher.type}'`);
        this.publisher = conditional_injector_1.Container.subclassesOf(publisher_1.Publisher).create(functionResponse.publisher);
        this.prePublishingFunctionReport = functionResponse;
        if (this.report.errorsDescription)
            this.report.errorsDescription = this.report.errorsDescription.concat(functionResponse.failingTests);
        if (functionResponse.exception) {
            if (this.report.errorsDescription)
                this.report.errorsDescription.concat(functionResponse.exception);
        }
    }
};
StartEventPublisherReporter = __decorate([
    conditional_injector_1.Injectable({ predicate: (startEvent) => startEvent.publisher != null }),
    __metadata("design:paramtypes", [Object])
], StartEventPublisherReporter);
exports.StartEventPublisherReporter = StartEventPublisherReporter;
