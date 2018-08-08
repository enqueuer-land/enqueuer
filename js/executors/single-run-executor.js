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
const enqueuer_executor_1 = require("./enqueuer-executor");
const multi_publisher_1 = require("../publishers/multi-publisher");
const single_run_input_1 = require("./single-run-input");
const configuration_1 = require("../configurations/configuration");
const logger_1 = require("../loggers/logger");
const conditional_injector_1 = require("conditional-injector");
const runnable_runner_1 = require("../runnables/runnable-runner");
const multi_result_creator_1 = require("../single-run-result-creators/multi-result-creator");
let SingleRunExecutor = class SingleRunExecutor extends enqueuer_executor_1.EnqueuerExecutor {
    constructor(enqueuerConfiguration) {
        super();
        logger_1.Logger.info('Executing in Single-Run mode');
        const singleRunConfiguration = enqueuerConfiguration['single-run'];
        this.multiResultCreator = new multi_result_creator_1.MultiResultCreator(enqueuerConfiguration['single-run'].reports);
        this.multiPublisher = new multi_publisher_1.MultiPublisher(new configuration_1.Configuration().getOutputs());
        this.singleRunInput = new single_run_input_1.SingleRunInput(singleRunConfiguration.fileNamePattern);
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.Logger.info('Initializing Single-Run mode');
            return this.singleRunInput.syncDir();
        });
    }
    execute() {
        return new Promise((resolve) => {
            this.singleRunInput.onNoMoreFilesToBeRead(() => this.onFinishRunnables(resolve));
            this.singleRunInput.receiveRequisition()
                .then(file => new runnable_runner_1.RunnableRunner(file.content).run()
                .then(report => {
                return { filename: file.name, report: report };
            }))
                .then((reportFile) => {
                this.multiResultCreator.addTestSuite(reportFile.filename, reportFile.report);
                return reportFile.report;
            })
                .then(report => this.multiPublisher.publish(JSON.stringify(report, null, 2)))
                .then(() => resolve(this.execute())) //Runs the next one
                .catch((err) => {
                logger_1.Logger.error(`Single-run error reported: ${JSON.stringify(err, null, 4)}`);
                this.multiResultCreator.addError(err);
                this.multiPublisher.publish(JSON.stringify(err, null, 2)).then().catch(console.log.bind(console));
                resolve(this.execute()); //Runs the next one
            });
        });
    }
    onFinishRunnables(resolve) {
        logger_1.Logger.info('There is no more requisition to be ran');
        this.multiResultCreator.create();
        return resolve(this.multiResultCreator.isValid());
    }
};
SingleRunExecutor = __decorate([
    conditional_injector_1.Injectable({ predicate: enqueuerConfiguration => enqueuerConfiguration['single-run'] }),
    __metadata("design:paramtypes", [Object])
], SingleRunExecutor);
exports.SingleRunExecutor = SingleRunExecutor;
