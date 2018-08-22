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
};
Object.defineProperty(exports, "__esModule", { value: true });
const publisher_1 = require("../../publishers/publisher");
const start_event_reporter_1 = require("./start-event-reporter");
const date_controller_1 = require("../../timers/date-controller");
const input = __importStar(require("../../models/inputs/publisher-model"));
const logger_1 = require("../../loggers/logger");
const conditional_injector_1 = require("conditional-injector");
const report_model_1 = require("../../models/outputs/report-model");
const event_test_executor_1 = require("../../testers/event-test-executor");
let StartEventPublisherReporter = class StartEventPublisherReporter extends start_event_reporter_1.StartEventReporter {
    constructor(startEvent) {
        super();
        const startEventPublisher = startEvent.publisher;
        this.report = {
            name: startEventPublisher.name,
            valid: true,
            type: startEventPublisher.type,
            tests: []
        };
        this.executeOnInitFunction(startEventPublisher);
        logger_1.Logger.debug(`Instantiating publisher from '${startEventPublisher.type}'`);
        this.publisher = conditional_injector_1.Container.subclassesOf(publisher_1.Publisher).create(startEventPublisher);
    }
    start() {
        logger_1.Logger.trace(`Firing publication as startEvent`);
        return new Promise((resolve, reject) => {
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
        });
    }
    getReport() {
        this.report.valid = this.report.valid && report_model_1.checkValidation(this.report);
        this.pushResponseMessageReceivedTest();
        return {
            publisher: this.report
        };
    }
    pushResponseMessageReceivedTest() {
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
        const message = this.publisher.messageReceived;
        if (!this.publisher.onMessageReceived || !message) {
            return;
        }
        logger_1.Logger.trace(`Publisher received response`);
        const eventTestExecutor = new event_test_executor_1.EventTestExecutor(this.publisher.onMessageReceived);
        eventTestExecutor.addArgument('publisher', this.publisher);
        eventTestExecutor.addArgument('message', message);
        if (typeof (message) == 'object' && !Buffer.isBuffer(message)) {
            Object.keys(message).forEach((key) => {
                eventTestExecutor.addArgument(key, message[key]);
            });
        }
        this.executeHookMethod(eventTestExecutor);
    }
    executeOnInitFunction(publisher) {
        if (publisher.onInit) {
            logger_1.Logger.info(`Executing publisher::onInit hook function`);
            const eventTestExecutor = new event_test_executor_1.EventTestExecutor(publisher.onInit);
            eventTestExecutor.addArgument('publisher', publisher);
            this.executeHookMethod(eventTestExecutor);
        }
    }
    executeHookMethod(eventTestExecutor) {
        const tests = eventTestExecutor.execute();
        this.report.tests = this.report.tests.concat(tests.map(test => {
            return { name: test.label, valid: test.valid, description: test.errorDescription };
        }));
    }
};
StartEventPublisherReporter = __decorate([
    conditional_injector_1.Injectable({ predicate: (startEvent) => startEvent.publisher != null }),
    __metadata("design:paramtypes", [Object])
], StartEventPublisherReporter);
exports.StartEventPublisherReporter = StartEventPublisherReporter;
