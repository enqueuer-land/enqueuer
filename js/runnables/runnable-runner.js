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
    }
    sequentialRunner(runnableFunctions) {
        return runnableFunctions.reduce((promise, runPromiseFunction) => promise.then(result => runPromiseFunction().then(Array.prototype.concat.bind(result))), Promise.resolve([]));
    }
    run() {
        const promises = this.runnableModel.runnables
            .map(runnable => () => conditional_injector_1.Container.subclassesOf(runner_1.Runner).create(runnable).run());
        return new Promise((resolve) => {
            new timeout_1.Timeout(() => {
                this.sequentialRunner(promises)
                    .then((reports) => reports.forEach((report) => {
                    this.report.valid = this.report.valid && report.valid;
                    this.report.runnables.push(report);
                }))
                    .then(() => resolve(this.report));
            })
                .start(this.runnableModel.initialDelay || 0);
        });
    }
};
RunnableRunner = __decorate([
    conditional_injector_1.Injectable({ predicate: runnable => runnable.runnables }),
    __metadata("design:paramtypes", [Object])
], RunnableRunner);
exports.RunnableRunner = RunnableRunner;
