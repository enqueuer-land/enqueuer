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
const injector_1 = require("../../injector/injector");
const container_1 = require("../../injector/container");
let StartEventPublisherReporter = class StartEventPublisherReporter extends start_event_reporter_1.StartEventReporter {
    constructor(startEvent) {
        super();
        this.prePublishingReport = {};
        this.publisherOriginalAttributes = startEvent.publisher;
        this.report = {
            valid: false,
            errorsDescription: []
        };
    }
    start() {
        return new Promise((resolve, reject) => {
            this.executePrePublishingFunction();
            if (this.publisher) {
                this.publisher.publish()
                    .then(() => {
                    resolve();
                })
                    .catch((err) => {
                    this.report.errorsDescription.push(`Error publishing start event '${this.publisher}'`);
                    reject(err);
                });
            }
            else {
                const message = `Impossible to define Publisher after prePublish function execution '${this.publisher}'`;
                this.report.errorsDescription.push(message);
                reject(message);
            }
        });
    }
    getReport() {
        this.report = Object.assign({}, this.publisherOriginalAttributes, { prePublishFunction: this.prePublishingReport, publisher: this.publisher, timestamp: new date_controller_1.DateController().toString(), valid: this.report.errorsDescription.length <= 0, errorsDescription: this.report.errorsDescription });
        return this.report;
    }
    executePrePublishingFunction() {
        const prePublishFunction = new pre_publish_meta_function_1.PrePublishMetaFunction(this.publisherOriginalAttributes);
        const functionResponse = new meta_function_executor_1.MetaFunctionExecutor(prePublishFunction).execute();
        if (functionResponse.publisher.payload)
            functionResponse.publisher.payload = JSON.stringify(functionResponse.publisher.payload);
        this.publisher = container_1.Container.get(publisher_1.Publisher).createFromPredicate(functionResponse.publisher);
        this.prePublishingReport = functionResponse.report;
    }
};
StartEventPublisherReporter = __decorate([
    injector_1.Injectable((startEvent) => startEvent.publisher),
    __metadata("design:paramtypes", [Object])
], StartEventPublisherReporter);
exports.StartEventPublisherReporter = StartEventPublisherReporter;
