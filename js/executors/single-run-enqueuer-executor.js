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
const enqueuer_executor_1 = require("./enqueuer-executor");
const multi_publisher_1 = require("../publishers/multi-publisher");
const single_run_requisition_input_1 = require("../requisitions/single-run-requisition-input");
const injector_1 = require("../injector/injector");
const configuration_1 = require("../configurations/configuration");
const requisition_starter_1 = require("../requisitions/requisition-starter");
const logger_1 = require("../loggers/logger");
const fs = require("fs");
const prettyjson = require('prettyjson');
let SingleRunEnqueuerExecutor = class SingleRunEnqueuerExecutor extends enqueuer_executor_1.EnqueuerExecutor {
    constructor(enqueuerConfiguration) {
        super();
        this.runningRequisitionsCounter = 0;
        const singleRunConfiguration = enqueuerConfiguration["single-run"];
        this.outputFilename = singleRunConfiguration["output-file"];
        this.multiPublisher = new multi_publisher_1.MultiPublisher(new configuration_1.Configuration().getOutputs());
        this.singleRunRequisitionInput =
            new single_run_requisition_input_1.SingleRunRequisitionInput(singleRunConfiguration.fileNamePattern);
        this.reportMerge = {
            valid: true,
            errorsDescription: [],
            requisitions: {}
        };
    }
    execute() {
        return new Promise((resolve) => {
            this.singleRunRequisitionInput.receiveRequisition()
                .then(requisition => {
                // this.multiPublisher.publish(JSON.stringify(requisition)).then().catch(console.log.bind(console));
                ++this.runningRequisitionsCounter;
                new requisition_starter_1.RequisitionStarter(requisition).start()
                    .then(report => {
                    --this.runningRequisitionsCounter;
                    logger_1.Logger.info(`Remaining requisitions to receive report: ${this.runningRequisitionsCounter}`);
                    this.mergeNewReport(report, requisition.id);
                    resolve(this.execute()); //Run the next one
                }).catch(console.log.bind(console));
                ;
            })
                .catch(() => {
                logger_1.Logger.info("There is no more requisition to be ran");
                this.summary(this.reportMerge);
                resolve(this.reportMerge);
            });
        });
    }
    mergeNewReport(newReport, id) {
        this.reportMerge.requisitions[id] = newReport.valid;
        this.reportMerge.valid = this.reportMerge.valid && newReport.valid;
        newReport.errorsDescription.forEach(newError => {
            this.reportMerge.errorsDescription.push(`[Requisition][${id}]${newError}`);
        });
    }
    summary(report) {
        const options = {
            defaultIndentation: 4,
            keysColor: "white",
            dashColor: "grey"
        };
        logger_1.Logger.info(`Reports summary:`);
        console.log(prettyjson.render(report, options));
        fs.writeFileSync(this.outputFilename, JSON.stringify(report, null, 3));
    }
    ;
};
SingleRunEnqueuerExecutor = __decorate([
    injector_1.Injectable(enqueuerConfiguration => enqueuerConfiguration["single-run"]),
    __metadata("design:paramtypes", [Object])
], SingleRunEnqueuerExecutor);
exports.SingleRunEnqueuerExecutor = SingleRunEnqueuerExecutor;
