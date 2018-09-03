"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const report_generator_1 = require("./report-generator");
const logger_1 = require("../loggers/logger");
const start_event_reporter_1 = require("./start-event/start-event-reporter");
const timeout_1 = require("../timers/timeout");
const multi_subscriptions_reporter_1 = require("./subscription/multi-subscriptions-reporter");
const conditional_injector_1 = require("conditional-injector");
const on_init_event_executor_1 = require("../events/on-init-event-executor");
const on_finish_event_executor_1 = require("../events/on-finish-event-executor");
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
        this.multiSubscriptionsReporter.subscribe(() => this.onAllSubscriptionsStopWaiting())
            .then(() => {
            logger_1.Logger.info('Multisubscriptions are ready');
            this.initializeTimeout();
            this.onSubscriptionsCompleted();
        })
            .catch(err => {
            const message = `Error connecting multiSubscription: ${err}`;
            logger_1.Logger.error(message);
            this.onFinish({ valid: false, description: message, name: 'Subscriptions subscription' });
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
            .then(() => {
            logger_1.Logger.debug('Start event triggered');
            this.startEventDoneItsJob = true;
            this.tryToFinishExecution();
        })
            .catch(err => {
            const message = `Error triggering startEvent: ${err}`;
            logger_1.Logger.error(message);
            this.onFinish({ valid: false, description: err, name: 'Start Event' });
        });
    }
    initializeTimeout() {
        if (this.requisitionTimeout) {
            new timeout_1.Timeout(() => {
                logger_1.Logger.info(`Requisition timed out`);
                this.onFinish();
            }).start(this.requisitionTimeout);
        }
    }
    onAllSubscriptionsStopWaiting() {
        logger_1.Logger.info('All subscriptions have done their job');
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
        this.executeOnFinishFunction();
        logger_1.Logger.info(`Start gathering reports`);
        if (error) {
            logger_1.Logger.debug(`Requisition error collected: ${JSON.stringify(error)}`);
            this.reportGenerator.addError(error);
        }
        this.reportGenerator.setStartEventReport(this.startEvent.getReport());
        this.reportGenerator.setSubscriptionReport(this.multiSubscriptionsReporter.getReport());
        this.reportGenerator.finish();
        this.onFinishCallback();
    }
    executeOnInitFunction() {
        logger_1.Logger.info(`Executing requisition::onInit hook function`);
        this.reportGenerator.addTests(new on_init_event_executor_1.OnInitEventExecutor('requisition', this.requisitionAttributes).trigger());
    }
    executeOnFinishFunction() {
        logger_1.Logger.info(`Executing requisition::onFinish hook function`);
        this.startEvent.onFinish();
        this.multiSubscriptionsReporter.onFinish();
        this.reportGenerator.addTests(new on_finish_event_executor_1.OnFinishEventExecutor('requisition', this.requisitionAttributes).trigger());
    }
}
exports.RequisitionReporter = RequisitionReporter;
