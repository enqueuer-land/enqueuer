"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const report_generator_1 = require("./report-generator");
const logger_1 = require("../loggers/logger");
const start_event_reporter_1 = require("./start-event/start-event-reporter");
const timeout_1 = require("../timers/timeout");
const multi_subscriptions_reporter_1 = require("./subscription/multi-subscriptions-reporter");
const conditional_injector_1 = require("conditional-injector");
const on_init_event_executor_1 = require("../events/on-init-event-executor");
const on_finish_event_executor_1 = require("../events/on-finish-event-executor");
const javascript_object_notation_1 = require("../object-notations/javascript-object-notation");
class RequisitionReporter {
    constructor(requisitionAttributes) {
        this.startEventDoneItsJob = false;
        this.allSubscriptionsStoppedWaiting = false;
        this.requisitionAttributes = requisitionAttributes;
        this.reportGenerator = new report_generator_1.ReportGenerator(this.requisitionAttributes);
        this.executeOnInitFunction();
        this.startEvent = conditional_injector_1.Container.subclassesOf(start_event_reporter_1.StartEventReporter).create(this.requisitionAttributes.startEvent);
        this.multiSubscriptionsReporter = new multi_subscriptions_reporter_1.MultiSubscriptionsReporter(this.requisitionAttributes.subscriptions);
        this.requisitionTimeout = this.requisitionAttributes.timeout;
        this.onFinishCallback = () => {
            //do nothing
        };
    }
    start(onFinishCallback) {
        this.reportGenerator.start(this.requisitionTimeout);
        this.onFinishCallback = onFinishCallback;
        logger_1.Logger.debug('Preparing subscriptions');
        this.multiSubscriptionsReporter
            .subscribe(() => this.onAllSubscriptionsStopWaiting())
            .then(() => {
            logger_1.Logger.info('Multisubscriptions are ready');
            this.initializeTimeout();
            return this.onSubscriptionsCompleted();
        })
            .catch(err => {
            const message = `Error connecting multiSubscription: ${err}`;
            logger_1.Logger.error(message);
            return this.onFinish({ valid: false, description: message, name: 'Subscriptions subscription' });
        });
    }
    getReport() {
        return this.reportGenerator.getReport();
    }
    onSubscriptionsCompleted() {
        this.multiSubscriptionsReporter.receiveMessage()
            .then(() => this.onAllSubscriptionsStopWaiting())
            .catch(err => {
            const message = `Error receiving message in multiSubscription: ${err}`;
            logger_1.Logger.error(message);
            this.onFinish({ valid: false, description: err, name: 'Subscriptions message receiving' });
        });
        logger_1.Logger.debug('Triggering start event');
        this.startEvent.start()
            .then(() => __awaiter(this, void 0, void 0, function* () {
            logger_1.Logger.debug('Start event triggered');
            this.startEventDoneItsJob = true;
            yield this.tryToFinishExecution();
        }))
            .catch((err) => __awaiter(this, void 0, void 0, function* () {
            const message = `Error triggering startEvent: ${err}`;
            logger_1.Logger.error(message);
            yield this.onFinish({ valid: false, description: err, name: 'Start Event' });
        }));
    }
    initializeTimeout() {
        if (this.requisitionTimeout) {
            new timeout_1.Timeout(() => {
                if (!this.startEventDoneItsJob || !this.allSubscriptionsStoppedWaiting) {
                    logger_1.Logger.info(`Requisition timed out`);
                    this.onFinish();
                }
            }).start(this.requisitionTimeout);
        }
    }
    onAllSubscriptionsStopWaiting() {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.Logger.info('All subscriptions have done their job');
            this.allSubscriptionsStoppedWaiting = true;
            yield this.tryToFinishExecution();
        });
    }
    tryToFinishExecution() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.startEventDoneItsJob && this.allSubscriptionsStoppedWaiting) {
                yield this.onFinish();
            }
        });
    }
    onFinish(error) {
        return __awaiter(this, void 0, void 0, function* () {
            this.onFinish = () => __awaiter(this, void 0, void 0, function* () {
                //do nothing
            });
            yield this.executeOnFinishFunction();
            logger_1.Logger.info(`Start gathering reports`);
            if (error) {
                logger_1.Logger.debug(`Requisition error collected: ${new javascript_object_notation_1.JavascriptObjectNotation().stringify(error)}`);
                this.reportGenerator.addError(error);
            }
            this.reportGenerator.setStartEventReport(this.startEvent.getReport());
            this.reportGenerator.setSubscriptionReport(this.multiSubscriptionsReporter.getReport());
            this.reportGenerator.finish();
            yield this.startEvent.unsubscribe();
            yield this.multiSubscriptionsReporter.unsubscribe();
            this.onFinishCallback();
        });
    }
    executeOnInitFunction() {
        logger_1.Logger.debug(`Executing requisition::onInit hook function`);
        this.reportGenerator.addTests(new on_init_event_executor_1.OnInitEventExecutor('requisition', this.requisitionAttributes).trigger());
    }
    executeOnFinishFunction() {
        this.multiSubscriptionsReporter.onFinish();
        this.reportGenerator.addTests(new on_finish_event_executor_1.OnFinishEventExecutor('requisition', this.requisitionAttributes).trigger());
        this.startEvent.onFinish();
    }
}
exports.RequisitionReporter = RequisitionReporter;
