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
const timeout_1 = require("../timers/timeout");
const multi_subscriptions_reporter_1 = require("./subscription/multi-subscriptions-reporter");
const on_init_event_executor_1 = require("../events/on-init-event-executor");
const on_finish_event_executor_1 = require("../events/on-finish-event-executor");
const javascript_object_notation_1 = require("../object-notations/javascript-object-notation");
const multi_publishers_reporter_1 = require("./publishers/multi-publishers-reporter");
class RequisitionReporter {
    constructor(requisitionAttributes) {
        this.allPublishersPublished = false;
        this.allSubscriptionsStoppedWaiting = false;
        this.requisitionAttributes = requisitionAttributes;
        this.reportGenerator = new report_generator_1.ReportGenerator(this.requisitionAttributes);
        this.executeOnInitFunction();
        this.multiSubscriptionsReporter = new multi_subscriptions_reporter_1.MultiSubscriptionsReporter(this.requisitionAttributes.subscriptions);
        this.multiPublishersReporter = new multi_publishers_reporter_1.MultiPublishersReporter(this.requisitionAttributes.publishers);
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
            return this.onRequisitionFinish({ valid: false, description: message, name: 'Subscriptions subscription' });
        });
    }
    getReport() {
        return this.reportGenerator.getReport();
    }
    onSubscriptionsCompleted() {
        this.multiSubscriptionsReporter.receiveMessage()
            .then(() => this.onAllSubscriptionsStopWaiting())
            .catch((err) => __awaiter(this, void 0, void 0, function* () {
            const message = `Error receiving message in multiSubscription: ${err}`;
            logger_1.Logger.error(message);
            yield this.onRequisitionFinish({ valid: false, description: err, name: 'Subscriptions message receiving' });
        }));
        this.multiPublishersReporter.publish()
            .then(() => __awaiter(this, void 0, void 0, function* () {
            logger_1.Logger.info('Publishers published');
            this.allPublishersPublished = true;
            yield this.tryToFinishExecution();
        }))
            .catch((err) => __awaiter(this, void 0, void 0, function* () {
            const message = `Error publishing publication: ${err}`;
            logger_1.Logger.error(message);
            yield this.onRequisitionFinish({ valid: false, description: err, name: 'Publishers publication' });
        }));
    }
    initializeTimeout() {
        if (this.requisitionTimeout) {
            new timeout_1.Timeout(() => __awaiter(this, void 0, void 0, function* () {
                if (!this.allPublishersPublished || !this.allSubscriptionsStoppedWaiting) {
                    logger_1.Logger.info(`Requisition timed out`);
                    yield this.onRequisitionFinish();
                }
            })).start(this.requisitionTimeout);
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
            if (this.allPublishersPublished && this.allSubscriptionsStoppedWaiting) {
                yield this.onRequisitionFinish();
            }
        });
    }
    onRequisitionFinish(error) {
        return __awaiter(this, void 0, void 0, function* () {
            this.onRequisitionFinish = () => __awaiter(this, void 0, void 0, function* () {
                //do nothing
            });
            yield this.executeOnFinishFunction();
            logger_1.Logger.info(`Start gathering reports`);
            if (error) {
                logger_1.Logger.debug(`Requisition error collected: ${new javascript_object_notation_1.JavascriptObjectNotation().stringify(error)}`);
                this.reportGenerator.addError(error);
            }
            this.reportGenerator.setPublishersReport(this.multiPublishersReporter.getReport());
            this.reportGenerator.setSubscriptionsReport(this.multiSubscriptionsReporter.getReport());
            this.reportGenerator.finish();
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
        this.multiPublishersReporter.onFinish();
    }
}
exports.RequisitionReporter = RequisitionReporter;
