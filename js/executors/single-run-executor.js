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
const report_compositor_1 = require("../reports/report-compositor");
const report_valid_fields_filter_1 = require("../reports/report-valid-fields-filter");
const fs = require("fs");
const prettyjson = require('prettyjson');
let SingleRunExecutor = class SingleRunExecutor extends enqueuer_executor_1.EnqueuerExecutor {
    constructor(enqueuerConfiguration) {
        super();
        logger_1.Logger.info("Executing in Single-Run mode");
        const singleRunConfiguration = enqueuerConfiguration["single-run"];
        this.outputFilename = singleRunConfiguration["output-file"];
        this.multiPublisher = new multi_publisher_1.MultiPublisher(new configuration_1.Configuration().getOutputs());
        this.singleRunInput =
            new single_run_input_1.SingleRunInput(singleRunConfiguration.fileNamePattern);
        this.reportCompositor = new report_compositor_1.ReportCompositor(singleRunConfiguration["name"] || "single-run-title");
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.Logger.info("Initializing Single-Run mode");
            return this.singleRunInput.syncDir();
        });
    }
    execute() {
        return new Promise((resolve) => {
            this.singleRunInput.onNoMoreFilesToBeRead(() => {
                logger_1.Logger.info("There is no more requisition to be ran");
                this.persistSummary();
                return resolve(this.reportCompositor.snapshot());
            });
            this.singleRunInput.receiveRequisition()
                .then(runnable => new runnable_runner_1.RunnableRunner(runnable).run())
                .then(report => { this.reportCompositor.addSubReport(report); return report; })
                .then(report => this.multiPublisher.publish(JSON.stringify(report, null, 2)))
                .then(() => resolve(this.execute())) //Run the next one
                .catch((err) => {
                this.multiPublisher.publish(JSON.stringify(err, null, 2)).then().catch(console.log.bind(console));
                logger_1.Logger.error(err);
                resolve(this.execute());
            });
        });
    }
    persistSummary() {
        const options = {
            defaultIndentation: 4,
            keysColor: "white",
            dashColor: "grey",
            inlineArrays: true
        };
        const snapshot = this.reportCompositor.snapshot();
        logger_1.Logger.debug(`Reports summary: ${JSON.stringify(snapshot, null, 4)}`);
        const filterReport = new report_valid_fields_filter_1.ReportValidFieldsFilter().filterReport(snapshot);
        console.log(prettyjson.render(filterReport, options));
        if (this.outputFilename)
            fs.writeFileSync(this.outputFilename, JSON.stringify(filterReport, null, 4));
    }
    ;
};
SingleRunExecutor = __decorate([
    conditional_injector_1.Injectable({ predicate: enqueuerConfiguration => enqueuerConfiguration["single-run"] }),
    __metadata("design:paramtypes", [Object])
], SingleRunExecutor);
exports.SingleRunExecutor = SingleRunExecutor;
