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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const daemon_run_input_1 = require("./daemon-run-input");
const logger_1 = require("../loggers/logger");
const multi_publisher_1 = require("../publishers/multi-publisher");
const enqueuer_executor_1 = require("./enqueuer-executor");
const configuration_1 = require("../configurations/configuration");
const conditional_injector_1 = require("conditional-injector");
const runnable_runner_1 = require("../runnables/runnable-runner");
let DaemonExecutor = class DaemonExecutor extends enqueuer_executor_1.EnqueuerExecutor {
    constructor(enqueuerConfiguration) {
        super();
        logger_1.Logger.info('Executing in Daemon mode');
        const configuration = new configuration_1.Configuration();
        this.multiPublisher = new multi_publisher_1.MultiPublisher(configuration.getOutputs());
        this.requisitionInputs = enqueuerConfiguration['daemon']
            .map((input) => new daemon_run_input_1.DaemonRunInput(input));
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            return;
        });
    }
    execute() {
        return new Promise(() => {
            this.requisitionInputs
                .forEach((input) => {
                input.connect()
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
            .then((runnable) => new runnable_runner_1.RunnableRunner(runnable).run())
            .then((report) => this.multiPublisher.publish(JSON.stringify(report)))
            .then(() => this.startReader(input))
            .catch((err) => {
            logger_1.Logger.error(err);
            this.multiPublisher.publish(JSON.stringify(err)).then(() => this.startReader(input));
        });
    }
};
DaemonExecutor = __decorate([
    conditional_injector_1.Injectable({ predicate: enqueuerConfiguration => enqueuerConfiguration['daemon'] }),
    __metadata("design:paramtypes", [Object])
], DaemonExecutor);
exports.DaemonExecutor = DaemonExecutor;
