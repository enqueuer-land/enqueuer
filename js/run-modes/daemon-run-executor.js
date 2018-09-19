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
const daemon_input_1 = require("./daemon-run-input-adapters/daemon-input");
const logger_1 = require("../loggers/logger");
const multi_publisher_1 = require("../publishers/multi-publisher");
const enqueuer_executor_1 = require("./enqueuer-executor");
const conditional_injector_1 = require("conditional-injector");
const multi_requisition_runner_1 = require("../requisition-runners/multi-requisition-runner");
const console_result_creator_1 = require("./single-run-result-creators/console-result-creator");
let DaemonRunExecutor = class DaemonRunExecutor extends enqueuer_executor_1.EnqueuerExecutor {
    constructor(configuration) {
        super();
        const daemonMode = configuration.runMode.daemon;
        logger_1.Logger.info('Executing in Daemon mode');
        this.multiPublisher = new multi_publisher_1.MultiPublisher(configuration.outputs);
        this.daemonInputs = daemonMode.map((input) => conditional_injector_1.Container.subclassesOf(daemon_input_1.DaemonInput).create(input));
    }
    execute() {
        return new Promise(() => {
            this.daemonInputs
                .forEach((input) => {
                input.subscribe()
                    .then(() => this.startReader(input))
                    .catch((err) => {
                    logger_1.Logger.error(err);
                    input.unsubscribe().catch();
                });
            });
        });
    }
    startReader(input) {
        input.receiveMessage()
            .then((requisition) => this.handleRequisitionReceived(requisition))
            .catch((err) => {
            logger_1.Logger.error(err);
            input.sendResponse(err).catch(console.log.bind(console));
            this.multiPublisher.publish(err).catch(console.log.bind(console));
            this.startReader(input);
        });
    }
    handleRequisitionReceived(message) {
        const resultCreator = new console_result_creator_1.ConsoleResultCreator();
        return new multi_requisition_runner_1.MultiRequisitionRunner(message.input, message.type).run()
            .then((report) => message.output = report)
            .then(() => message.output && resultCreator.addTestSuite(message.type, message.output))
            .then(() => resultCreator.create())
            .then(() => message.daemon.sendResponse(message))
            .then(() => message.daemon.cleanUp())
            .then(() => this.multiPublisher.publish(message.output))
            .then(() => this.startReader(message.daemon));
    }
};
DaemonRunExecutor = __decorate([
    conditional_injector_1.Injectable({ predicate: (configuration) => configuration.runMode && configuration.runMode.daemon != null }),
    __metadata("design:paramtypes", [Object])
], DaemonRunExecutor);
exports.DaemonRunExecutor = DaemonRunExecutor;
