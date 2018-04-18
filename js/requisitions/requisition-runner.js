"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const report_generator_1 = require("../reporters/report-generator");
const logger_1 = require("../loggers/logger");
const start_event_reporter_1 = require("../reporters/start-event/start-event-reporter");
const container_1 = require("../injector/container");
const timeout_1 = require("../timers/timeout");
const multi_subscriptions_reporter_1 = require("../reporters/subscription/multi-subscriptions-reporter");
class RequisitionRunner {
    constructor(requisitionAttributes) {
        this.reportGenerator = new report_generator_1.ReportGenerator(requisitionAttributes);
        this.startEvent = container_1.Container.get(start_event_reporter_1.StartEventReporter).createFromPredicate(requisitionAttributes.startEvent);
        this.multiSubscriptionsReporter = new multi_subscriptions_reporter_1.MultiSubscriptionsReporter(requisitionAttributes.subscriptions);
        this.requisitionTimeout = requisitionAttributes.timeout;
        this.onFinishCallback = () => { };
    }
    start(onFinishCallback) {
        this.reportGenerator.start(this.requisitionTimeout);
        this.onFinishCallback = onFinishCallback;
        logger_1.Logger.trace("Multisubscribing");
        this.multiSubscriptionsReporter.connect()
            .then(() => {
            logger_1.Logger.trace("Multisubscriptions are ready");
            this.initializeTimeout();
            this.onSubscriptionsCompleted();
        })
            .catch(err => {
            logger_1.Logger.error(`Error connecting multiSubscription: ${err}`);
            this.onFinish(err);
        });
    }
    onSubscriptionsCompleted() {
        this.multiSubscriptionsReporter.receiveMessage()
            .then(() => this.onAllSubscriptionsStopWaiting())
            .catch(err => {
            logger_1.Logger.error(`Error receiving message in multiSubscription: ${err}`);
            this.onFinish(err);
        });
        logger_1.Logger.debug("Triggering start event");
        this.startEvent.start()
            .then(() => {
            logger_1.Logger.debug("Start event has done its job");
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
                this.onFinish("Requisition has timed out");
            }).start(this.requisitionTimeout);
        }
    }
    onAllSubscriptionsStopWaiting() {
        logger_1.Logger.info("All subscriptions stopped waiting");
        this.onFinish();
    }
    onFinish(error) {
        this.onFinish = () => { };
        logger_1.Logger.info(`Start gathering reports`);
        if (error) {
            logger_1.Logger.debug(`Error collected: ${error}`);
            this.reportGenerator.addError(error);
        }
        this.reportGenerator.setStartEventReport(this.startEvent.getReport());
        this.reportGenerator.setSubscriptionReport(this.multiSubscriptionsReporter.getReport());
        this.reportGenerator.finish();
        this.onFinishCallback(this.reportGenerator.getReport());
    }
}
exports.RequisitionRunner = RequisitionRunner;
