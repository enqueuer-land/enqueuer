"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const report_generator_1 = require("./report-generator");
const logger_1 = require("../loggers/logger");
const start_event_reporter_1 = require("./start-event/start-event-reporter");
const timeout_1 = require("../timers/timeout");
const multi_subscriptions_reporter_1 = require("./subscription/multi-subscriptions-reporter");
const conditional_injector_1 = require("conditional-injector");
class RequisitionReporter {
    constructor(requisitionAttributes) {
        this.startEventDoneItsJob = false;
        this.allSubscriptionsStoppedWaiting = false;
        this.reportGenerator = new report_generator_1.ReportGenerator(requisitionAttributes);
        this.startEvent = conditional_injector_1.Container.subclassesOf(start_event_reporter_1.StartEventReporter).create(requisitionAttributes.startEvent);
        this.multiSubscriptionsReporter = new multi_subscriptions_reporter_1.MultiSubscriptionsReporter(requisitionAttributes.subscriptions);
        this.requisitionTimeout = requisitionAttributes.timeout;
        this.onFinishCallback = () => {
            //do nothing
        };
    }
    start(onFinishCallback) {
        this.reportGenerator.start(this.requisitionTimeout);
        this.onFinishCallback = onFinishCallback;
        logger_1.Logger.trace('Multisubscribing');
        this.multiSubscriptionsReporter.connect()
            .then(() => {
            logger_1.Logger.trace('Multisubscriptions are ready');
            this.initializeTimeout();
            this.onSubscriptionsCompleted();
        })
            .catch(err => {
            logger_1.Logger.error(`Error connecting multiSubscription: ${err}`);
            this.onFinish(err);
        });
    }
    getReport() {
        return this.reportGenerator.getReport();
    }
    onSubscriptionsCompleted() {
        this.multiSubscriptionsReporter.receiveMessage()
            .then(() => this.onAllSubscriptionsStopWaiting())
            .catch(err => {
            logger_1.Logger.error(`Error receiving message in multiSubscription: ${err}`);
            this.onFinish(err);
        });
        logger_1.Logger.debug('Triggering start event');
        this.startEvent.start()
            .then(() => {
            this.startEventDoneItsJob = true;
            this.tryToFinishExecution();
        })
            .catch(err => {
            const message = `Error triggering startingEvent: ${err}`;
            logger_1.Logger.error(message);
            this.onFinish(message);
        });
    }
    initializeTimeout() {
        if (this.requisitionTimeout) {
            new timeout_1.Timeout(() => {
                this.onFinish('Requisition has timed out');
            }).start(this.requisitionTimeout);
        }
    }
    onAllSubscriptionsStopWaiting() {
        logger_1.Logger.info('All subscriptions stopped waiting');
        this.allSubscriptionsStoppedWaiting = true;
        this.tryToFinishExecution();
    }
    tryToFinishExecution() {
        if (this.startEventDoneItsJob && this.allSubscriptionsStoppedWaiting) {
            this.onFinish();
        }
    }
    onFinish(error) {
        this.onFinish = () => {
            //do nothing
        };
        logger_1.Logger.info(`Start gathering reports`);
        if (error) {
            logger_1.Logger.debug(`Error collected: ${error}`);
            this.reportGenerator.addError(error);
        }
        this.reportGenerator.setStartEventReport(this.startEvent.getReport());
        this.reportGenerator.setSubscriptionReport(this.multiSubscriptionsReporter.getReport());
        this.reportGenerator.finish();
        this.onFinishCallback();
    }
}
exports.RequisitionReporter = RequisitionReporter;
