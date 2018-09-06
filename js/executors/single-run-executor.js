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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const enqueuer_executor_1 = require("./enqueuer-executor");
const multi_publisher_1 = require("../publishers/multi-publisher");
const logger_1 = require("../loggers/logger");
const conditional_injector_1 = require("conditional-injector");
const multi_result_creator_1 = require("../single-run-result-creators/multi-result-creator");
const requisition_parser_1 = require("../runners/requisition-parser");
const glob = __importStar(require("glob"));
const fs = __importStar(require("fs"));
const multi_requisition_runner_1 = require("../runners/multi-requisition-runner");
//TODO test it
let SingleRunExecutor = class SingleRunExecutor extends enqueuer_executor_1.EnqueuerExecutor {
    constructor(configuration) {
        super();
        logger_1.Logger.info('Executing in Single-Run mode');
        const singleRunMode = configuration.runMode['single-run'];
        const singleRunConfiguration = singleRunMode;
        this.multiResultCreator = new multi_result_creator_1.MultiResultCreator(singleRunMode.reportName);
        this.parallelMode = !!singleRunMode.parallel;
        this.multiPublisher = new multi_publisher_1.MultiPublisher(configuration.outputs);
        this.fileNames = this.getTestFiles(singleRunConfiguration.files);
        this.totalFilesNum = this.fileNames.length;
    }
    execute() {
        if (this.totalFilesNum == 0) {
            return Promise.reject(`No test file was found`);
        }
        if (this.parallelMode) {
            return this.executeParallelMode();
        }
        else {
            return this.executeSequentialMode(this.fileNames);
        }
    }
    executeSequentialMode(fileNames) {
        return new Promise((resolve) => {
            const fileName = fileNames.shift();
            if (fileName) {
                this.runFile(fileName)
                    .then(() => resolve(this.executeSequentialMode(fileNames)));
            }
            else {
                resolve(this.finishExecution());
            }
        });
    }
    executeParallelMode() {
        return new Promise((resolve) => {
            Promise.all(this.fileNames
                .map((fileName) => this.runFile(fileName)))
                .then(() => resolve(this.finishExecution()));
        });
    }
    getTestFiles(files) {
        let result = [];
        if (files) {
            files.forEach((file) => {
                result = result.concat(glob.sync(file));
            });
            logger_1.Logger.info(`Files list: ${result}`);
        }
        return result;
    }
    sendErrorMessage(message) {
        logger_1.Logger.error(message);
        this.multiResultCreator.addError(message);
        this.multiPublisher.publish(message).then().catch(console.log.bind(console));
    }
    runFile(filename) {
        return new Promise((resolve) => {
            const requisitions = this.parseFile(filename);
            if (requisitions) {
                new multi_requisition_runner_1.MultiRequisitionRunner(requisitions, filename)
                    .run()
                    .then(report => {
                    this.multiResultCreator.addTestSuite(filename, report);
                    this.multiPublisher.publish(report).catch(console.log.bind(console));
                    resolve();
                })
                    .catch((err) => {
                    this.sendErrorMessage(`Single-run error reported: ${JSON.stringify(err, null, 2)}`);
                    resolve();
                });
            }
            else {
                resolve();
            }
        });
    }
    parseFile(fileName) {
        try {
            return new requisition_parser_1.RequisitionParser().parse(fs.readFileSync(fileName).toString());
        }
        catch (err) {
            this.sendErrorMessage(`Error parsing: ${fileName}: ` + err);
        }
        return undefined;
    }
    finishExecution() {
        logger_1.Logger.info('There is no more files to be ran');
        this.multiResultCreator.create();
        return this.multiResultCreator.isValid();
    }
};
SingleRunExecutor = __decorate([
    conditional_injector_1.Injectable({ predicate: (configuration) => configuration.runMode && configuration.runMode['single-run'] != null }),
    __metadata("design:paramtypes", [Object])
], SingleRunExecutor);
exports.SingleRunExecutor = SingleRunExecutor;
