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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
}
Object.defineProperty(exports, "__esModule", { value: true });
///<reference path="../../variables/variables-controller.ts"/>
const publisher_1 = require("../../publishers/publisher");
const start_event_reporter_1 = require("./start-event-reporter");
const pre_publish_meta_function_body_1 = require("../../meta-functions/pre-publish-meta-function-body");
const meta_function_executor_1 = require("../../meta-functions/meta-function-executor");
const date_controller_1 = require("../../timers/date-controller");
const input = __importStar(require("../../models/inputs/publisher-model"));
const logger_1 = require("../../loggers/logger");
const conditional_injector_1 = require("conditional-injector");
const on_message_received_reporter_1 = require("../../meta-functions/on-message-received-reporter");
const report_model_1 = require("../../models/outputs/report-model");
const json_placeholder_replacer_1 = require("json-placeholder-replacer");
const variables_controller_1 = require("../../variables/variables-controller");
let StartEventPublisherReporter = class StartEventPublisherReporter extends start_event_reporter_1.StartEventReporter {
    constructor(startEvent) {
        super();
        this.publisherOriginalAttributes = startEvent.publisher;
        this.report = {
            name: this.publisherOriginalAttributes.name,
            valid: true,
            type: this.publisherOriginalAttributes.type,
            tests: {}
        };
    }
    start() {
        logger_1.Logger.trace(`Firing publication as startEvent`);
        return new Promise((resolve, reject) => {
            this.executePrePublishingFunction();
            if (this.publisher) {
                this.report.publishTime = new date_controller_1.DateController().toString();
                this.publisher.publish()
                    .then(() => {
                    this.executeOnMessageReceivedFunction();
                    return resolve();
                })
                    .catch((err) => {
                    logger_1.Logger.error(err);
                    this.report.tests[`Error publishing start event '${this.publisher}'`] = false;
                    reject(err);
                });
            }
            else {
                const message = `Publisher is undefined after prePublish function execution '${this.publisher}'`;
                this.report.tests[message] = false;
                reject(message);
            }
        });
    }
    getReport() {
        this.report.valid = this.report.valid && report_model_1.checkValidation(this.report);
        return {
            publisher: this.report
        };
    }
    executeOnMessageReceivedFunction() {
        if (!this.publisher || !this.publisher.messageReceived || !this.publisher.onMessageReceived)
            return;
        const onMessageReceivedReporter = new on_message_received_reporter_1.OnMessageReceivedReporter(this.publisher.messageReceived, this.publisher.onMessageReceived);
        const functionResponse = onMessageReceivedReporter.execute();
        functionResponse.tests
            .map((test) => this.report.tests[test.name] = test.valid);
    }
    executePrePublishingFunction() {
        const prePublishFunction = new pre_publish_meta_function_body_1.PrePublishMetaFunctionBody(this.publisherOriginalAttributes);
        let functionResponse = new meta_function_executor_1.MetaFunctionExecutor(prePublishFunction).execute();
        logger_1.Logger.debug(`PrePublishingFunctionReport: ${JSON.stringify(functionResponse, null, 3)}`);
        const placeHolderReplacer = new json_placeholder_replacer_1.JsonPlaceholderReplacer();
        placeHolderReplacer
            .addVariableMap(variables_controller_1.VariablesController.persistedVariables())
            .addVariableMap(variables_controller_1.VariablesController.sessionVariables());
        functionResponse = placeHolderReplacer.replace(functionResponse);
        logger_1.Logger.debug(`Replaced PrePublishingFunctionReport: ${JSON.stringify(functionResponse, null, 3)}`);
        if (functionResponse.publisher.payload)
            functionResponse.publisher.payload = JSON.stringify(functionResponse.publisher.payload);
        logger_1.Logger.trace(`Instantiating requisition publisher from '${functionResponse.publisher.type}'`);
        this.publisher = conditional_injector_1.Container.subclassesOf(publisher_1.Publisher).create(functionResponse.publisher);
        functionResponse.tests
            .map((test) => this.report.tests[test.name] = test.valid);
        if (functionResponse.exception) {
            this.report.tests[functionResponse.exception] = false;
        }
    }
};
StartEventPublisherReporter = __decorate([
    conditional_injector_1.Injectable({ predicate: (startEvent) => startEvent.publisher != null }),
    __metadata("design:paramtypes", [Object])
], StartEventPublisherReporter);
exports.StartEventPublisherReporter = StartEventPublisherReporter;
