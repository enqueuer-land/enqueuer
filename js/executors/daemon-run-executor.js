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
var DaemonRunExecutor_1;
"use strict";
const daemon_input_1 = require("./daemon-input");
const logger_1 = require("../loggers/logger");
const multi_publisher_1 = require("../publishers/multi-publisher");
const enqueuer_executor_1 = require("./enqueuer-executor");
const conditional_injector_1 = require("conditional-injector");
const multi_requisition_runner_1 = require("../runners/multi-requisition-runner");
const store_1 = require("../configurations/store");
let DaemonRunExecutor = DaemonRunExecutor_1 = class DaemonRunExecutor extends enqueuer_executor_1.EnqueuerExecutor {
    constructor(configuration) {
        super();
        const daemonMode = configuration.runMode.daemon;
        logger_1.Logger.info('Executing in Daemon mode');
        this.multiPublisher = new multi_publisher_1.MultiPublisher(configuration.outputs);
        this.daemonInputs = daemonMode.map((input) => new daemon_input_1.DaemonInput(input));
    }
    execute() {
        return new Promise(() => {
            this.daemonInputs
                .forEach((input) => {
                input.subscribe()
                    .then(() => {
                    return this.startReader(input);
                })
                    .catch((err) => {
                    logger_1.Logger.error(err);
                    input.unsubscribe();
                });
            });
        });
    }
    startReader(input) {
        input.receiveMessage()
            .then((requisitions) => new multi_requisition_runner_1.MultiRequisitionRunner(requisitions, input.getType()).run())
            .then((report) => {
            const message = Object.assign({}, report, { store: DaemonRunExecutor_1.decycle(store_1.Store.getData()) });
            return this.multiPublisher.publish(message);
        })
            .then(() => this.startReader(input))
            .catch((err) => {
            logger_1.Logger.error(err);
            this.multiPublisher.publish(err)
                .then(() => {
                this.startReader(input);
            })
                .catch((err) => {
                logger_1.Logger.error(err);
                this.startReader(input);
            });
        });
    }
    static decycle(valueToStringify) {
        const cache = new Map();
        const stringified = JSON.stringify(valueToStringify, (key, value) => {
            if (typeof (value) === 'object' && value !== null) {
                if (cache.has(value)) {
                    // Circular reference found, discard key
                    return;
                }
                // Store value in our map
                cache.set(value, true);
            }
            return value;
        });
        return JSON.parse(stringified);
    }
};
DaemonRunExecutor = DaemonRunExecutor_1 = __decorate([
    conditional_injector_1.Injectable({ predicate: (configuration) => configuration.runMode && configuration.runMode.daemon != null }),
    __metadata("design:paramtypes", [Object])
], DaemonRunExecutor);
exports.DaemonRunExecutor = DaemonRunExecutor;
