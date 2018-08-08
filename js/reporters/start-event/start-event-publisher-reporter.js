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
const publisher_1 = require("../../publishers/publisher");
const start_event_reporter_1 = require("./start-event-reporter");
const date_controller_1 = require("../../timers/date-controller");
const input = __importStar(require("../../models/inputs/publisher-model"));
const logger_1 = require("../../loggers/logger");
const conditional_injector_1 = require("conditional-injector");
const report_model_1 = require("../../models/outputs/report-model");
const json_placeholder_replacer_1 = require("json-placeholder-replacer");
const variables_controller_1 = require("../../variables/variables-controller");
const tester_executor_1 = require("../../testers/tester-executor");
let StartEventPublisherReporter = class StartEventPublisherReporter extends start_event_reporter_1.StartEventReporter {
    constructor(startEvent) {
        super();
        this.publisherOriginalAttributes = startEvent.publisher;
        this.report = {
            name: this.publisherOriginalAttributes.name,
            valid: true,
            type: this.publisherOriginalAttributes.type,
            tests: []
        };
    }
    start() {
        logger_1.Logger.trace(`Firing publication as startEvent`);
        return new Promise((resolve, reject) => {
            this.executePrePublishingFunction();
            logger_1.Logger.debug(`Instantiating requisition publisher from '${this.publisherOriginalAttributes.type}'`);
            this.publisher = conditional_injector_1.Container.subclassesOf(publisher_1.Publisher).create(this.publisherOriginalAttributes);
            if (this.publisher) {
                this.publisher.publish()
                    .then(() => {
                    logger_1.Logger.trace(`Start event published`);
                    this.report.publishTime = new date_controller_1.DateController().toString();
                    this.report.tests.push({ name: 'Published', valid: true, description: 'Published successfully' });
                    this.executeOnMessageReceivedFunction();
                    return resolve();
                })
                    .catch((err) => {
                    logger_1.Logger.error(err);
                    this.report.tests.push({ name: 'Published', valid: false, description: err.toString() });
                    reject(err);
                });
            }
            else {
                const message = `Publisher is undefined after prePublish function execution ' ` +
                    `${JSON.stringify(this.publisherOriginalAttributes, null, 2)}'`;
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
        if (!this.publisher || !this.publisher.onMessageReceived || !this.publisher.messageReceived) {
            return;
        }
        logger_1.Logger.trace(`Publisher received message: ${this.publisher.messageReceived.substr(0, 100)}`);
        const testExecutor = new tester_executor_1.TesterExecutor(this.publisher.onMessageReceived);
        testExecutor.addArgument('publisher', this.publisher);
        testExecutor.addArgument('message', this.publisher.messageReceived);
        const tests = testExecutor.execute();
        this.report.tests = this.report.tests.concat(tests.map(test => {
            return { name: test.label, valid: test.valid, description: test.description };
        }));
    }
    executePrePublishingFunction() {
        if (!this.publisherOriginalAttributes.prePublishing) {
            return;
        }
        logger_1.Logger.trace(`Executing pre publishing function`);
        const testExecutor = new tester_executor_1.TesterExecutor(this.publisherOriginalAttributes.prePublishing);
        testExecutor.addArgument('publisher', this.publisherOriginalAttributes);
        const tests = testExecutor.execute();
        const placeHolderReplacer = new json_placeholder_replacer_1.JsonPlaceholderReplacer();
        placeHolderReplacer
            .addVariableMap(variables_controller_1.VariablesController.persistedVariables())
            .addVariableMap(variables_controller_1.VariablesController.sessionVariables());
        this.publisherOriginalAttributes = placeHolderReplacer.replace(this.publisherOriginalAttributes);
        logger_1.Logger.trace(`Adding prePublishing functions tests to report`);
        this.report.tests = this.report.tests.concat(tests.map(test => {
            return { name: test.label, valid: test.valid, description: test.description };
        }));
    }
};
StartEventPublisherReporter = __decorate([
    conditional_injector_1.Injectable({ predicate: (startEvent) => startEvent.publisher != null }),
    __metadata("design:paramtypes", [Object])
], StartEventPublisherReporter);
exports.StartEventPublisherReporter = StartEventPublisherReporter;
