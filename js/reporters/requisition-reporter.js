"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const report_generator_1 = require("./report-generator");
const logger_1 = require("../loggers/logger");
const start_event_reporter_1 = require("./start-event/start-event-reporter");
const timeout_1 = require("../timers/timeout");
const multi_subscriptions_reporter_1 = require("./subscription/multi-subscriptions-reporter");
const conditional_injector_1 = require("conditional-injector");
const tester_executor_1 = require("../testers/tester-executor");
class RequisitionReporter {
    constructor(requisitionAttributes) {
        this.startEventDoneItsJob = false;
        this.allSubscriptionsStoppedWaiting = false;
        this.reportGenerator = new report_generator_1.ReportGenerator(requisitionAttributes);
        if (requisitionAttributes.onInit) {
            logger_1.Logger.info(`Executing requisition::onInit hook function`);
            const testExecutor = new tester_executor_1.TesterExecutor(requisitionAttributes.onInit);
            testExecutor.addArgument('requisition', requisitionAttributes);
            this.executeHookFunction(testExecutor);
        }
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
        this.multiSubscriptionsReporter.subscribe()
            .then(() => {
            logger_1.Logger.trace('Multisubscriptions are ready');
            this.initializeTimeout();
            this.onSubscriptionsCompleted();
        })
            .catch(err => {
            const message = `Error connecting multiSubscription: ${err}`;
            logger_1.Logger.error(message);
            this.onFinish({ valid: false, description: message, name: 'Subscriptions connection' });
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
                this.onFinish();
            }).start(this.requisitionTimeout);
        }
    }
    onAllSubscriptionsStopWaiting() {
        logger_1.Logger.info('All subscriptions stopped waiting');
        this.allSubscriptionsStoppedWaiting = true;
        this.tryToFinishExecution();
    }
    tryToFinishExecution() {
        if (!this.startEventDoneItsJob) {
            logger_1.Logger.info(`Waiting for start event to finish requisition execution`);
        }
        else {
            logger_1.Logger.info(`Waiting for all subscriptions receive their messages to finish requisition execution`);
        }
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
            logger_1.Logger.debug(`Requisition error collected: ${JSON.stringify(error)}`);
            this.reportGenerator.addError(error);
        }
        this.reportGenerator.setStartEventReport(this.startEvent.getReport());
        this.reportGenerator.setSubscriptionReport(this.multiSubscriptionsReporter.getReport());
        this.reportGenerator.finish();
        this.onFinishCallback();
    }
    executeHookFunction(testExecutor) {
        const tests = testExecutor.execute();
        this.reportGenerator.addTests(tests.map(test => {
            return { name: test.label, valid: test.valid, description: test.description };
        }));
    }
}
exports.RequisitionReporter = RequisitionReporter;
