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
const conditional_injector_1 = require("conditional-injector");
const runner_1 = require("./runner");
const timeout_1 = require("../timers/timeout");
const logger_1 = require("../loggers/logger");
let RunnableRunner = class RunnableRunner extends runner_1.Runner {
    constructor(runnableModel) {
        super();
        this.runnableModel = runnableModel;
        this.report = {
            type: 'runnable',
            valid: true,
            tests: [],
            name: this.runnableModel.name,
            id: this.runnableModel.id,
            runnables: []
        };
        this.addDefaultName();
    }
    run() {
        const delay = this.runnableModel.delay;
        const promises = this.promisifyRunnableExecutionCall();
        return new Promise((resolve, reject) => {
            if (delay) {
                logger_1.Logger.info(`Delaying execution for ${delay}ms`);
            }
            new timeout_1.Timeout(() => {
                this.sequentialRunner(promises)
                    .then((reports) => {
                    logger_1.Logger.info(`Got runnable 'reports ${this.report.name}`);
                    reports.forEach((report) => {
                        this.report.valid = this.report.valid && report.valid;
                        this.report.runnables.push(report);
                    });
                })
                    .then(() => resolve(this.report))
                    .catch((err) => {
                    logger_1.Logger.error(`Error running sequentially: ${err}`);
                    reject(err);
                });
            })
                .start(delay || 0);
        });
    }
    addDefaultName() {
        let requisitionCounter = 0;
        let runnableCounter = 0;
        this.runnableModel.runnables.map((runnable) => {
            if (!runnable.name) {
                if (runnable.runnables) {
                    runnable.name = `Runnable #${runnableCounter++}`;
                }
                else {
                    runnable.name = `Requisition #${requisitionCounter++}`;
                }
            }
        });
    }
    promisifyRunnableExecutionCall() {
        return this.multiplyIterations()
            .map(runnable => () => conditional_injector_1.Container
            .subclassesOf(runner_1.Runner)
            .create(runnable)
            .run());
    }
    multiplyIterations() {
        if (!this.runnableModel.iterations) {
            return this.runnableModel.runnables;
        }
        let runnables = [];
        for (let x = this.runnableModel.iterations; x > 0; --x) {
            const clone = this.runnableModel.runnables.map(x => (Object.assign({}, x)));
            const items = clone
                .map((item) => {
                item.name = item.name + ` [${x}]`;
                return item;
            });
            runnables = runnables.concat(items);
        }
        return runnables;
    }
    sequentialRunner(runnableFunctions) {
        return runnableFunctions.reduce((runnableRan, runPromiseFunction) => {
            return runnableRan
                .then(result => runPromiseFunction().then(Array.prototype.concat.bind(result)))
                .catch(err => logger_1.Logger.error(`Error running run promise ${err}`));
        }, Promise.resolve([]));
    }
};
RunnableRunner = __decorate([
    conditional_injector_1.Injectable({ predicate: runnable => runnable.runnables }),
    __metadata("design:paramtypes", [Object])
], RunnableRunner);
exports.RunnableRunner = RunnableRunner;
