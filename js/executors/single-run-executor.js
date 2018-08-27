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
const configuration_1 = require("../configurations/configuration");
const logger_1 = require("../loggers/logger");
const conditional_injector_1 = require("conditional-injector");
const runnable_runner_1 = require("../runnables/runnable-runner");
const multi_result_creator_1 = require("../single-run-result-creators/multi-result-creator");
const runnable_parser_1 = require("../runnables/runnable-parser");
const glob = __importStar(require("glob"));
const fs = __importStar(require("fs"));
let SingleRunExecutor = class SingleRunExecutor extends enqueuer_executor_1.EnqueuerExecutor {
    constructor(runMode) {
        super();
        logger_1.Logger.info('Executing in Single-Run mode');
        const singleRunMode = runMode['single-run'];
        const singleRunConfiguration = singleRunMode;
        this.multiResultCreator = new multi_result_creator_1.MultiResultCreator(singleRunMode.reportName);
        this.parallelMode = !!singleRunMode.parallel;
        this.multiPublisher = new multi_publisher_1.MultiPublisher(new configuration_1.Configuration().getOutputs());
        this.runnableFileNames = this.getTestFiles(singleRunConfiguration.files);
        this.totalFilesNum = this.runnableFileNames.length;
    }
    execute() {
        if (this.totalFilesNum == 0) {
            return Promise.reject(`No test file was found`);
        }
        if (this.parallelMode) {
            return this.executeParallelMode();
        }
        else {
            return this.executeSequentialMode(this.runnableFileNames);
        }
    }
    executeSequentialMode(runnableFileNames) {
        return new Promise((resolve) => {
            const nameIndex = this.totalFilesNum - runnableFileNames.length;
            const fileName = runnableFileNames.shift();
            if (fileName) {
                const runnable = this.parseFileRunnable(fileName);
                if (runnable) {
                    this.runFileRunnable(fileName, this.setDefaultFileRunnableName(runnable, nameIndex))
                        .then(() => resolve(this.executeSequentialMode(runnableFileNames)));
                }
                else {
                    resolve(this.executeSequentialMode(runnableFileNames));
                }
            }
            else {
                resolve(this.finishExecution());
            }
        });
    }
    executeParallelMode() {
        return new Promise((resolve) => {
            Promise.all(this.runnableFileNames.map((fileName, index) => {
                const runnable = this.parseFileRunnable(fileName);
                if (runnable) {
                    return this.runFileRunnable(fileName, this.setDefaultFileRunnableName(runnable, index));
                }
                else {
                    return {};
                }
            })).then(() => resolve(this.finishExecution()));
        });
    }
    setDefaultFileRunnableName(runnable, index) {
        if (!runnable.name) {
            runnable.name = `Runnable #${index}`;
        }
        return runnable;
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
    parseFileRunnable(fileName) {
        try {
            return new runnable_parser_1.RunnableParser().parse(fs.readFileSync(fileName).toString());
        }
        catch (err) {
            this.sendErrorMessage(`Error parsing: ${fileName}: ` + err);
        }
        return undefined;
    }
    sendErrorMessage(message) {
        logger_1.Logger.error(message);
        this.multiResultCreator.addError(message);
        this.multiPublisher.publish(message).then().catch(console.log.bind(console));
    }
    runFileRunnable(name, runnable) {
        return new Promise((resolve) => {
            new runnable_runner_1.RunnableRunner(runnable)
                .run()
                .then(report => {
                this.multiResultCreator.addTestSuite(name, report);
                this.multiPublisher.publish(report).catch(console.log.bind(console));
                resolve();
            })
                .catch((err) => {
                this.sendErrorMessage(`Single-run error reported: ${JSON.stringify(err, null, 2)}`);
                resolve();
            });
        });
    }
    finishExecution() {
        logger_1.Logger.info('There is no more requisition to be ran');
        this.multiResultCreator.create();
        return this.multiResultCreator.isValid();
    }
};
SingleRunExecutor = __decorate([
    conditional_injector_1.Injectable({ predicate: runMode => runMode['single-run'] }),
    __metadata("design:paramtypes", [Object])
], SingleRunExecutor);
exports.SingleRunExecutor = SingleRunExecutor;
