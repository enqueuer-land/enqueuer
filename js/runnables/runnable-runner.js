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
const json_placeholder_replacer_1 = require("json-placeholder-replacer");
const variables_controller_1 = require("../variables/variables-controller");
let RunnableRunner = class RunnableRunner extends runner_1.Runner {
    constructor(runnableModel) {
        super();
        this.runnableModel = runnableModel;
        this.placeHolderReplacer = new json_placeholder_replacer_1.JsonPlaceholderReplacer();
        this.report = {
            type: "runnable",
            valid: true,
            tests: {},
            name: this.runnableModel.name,
            id: this.runnableModel.id,
            runnables: []
        };
    }
    run() {
        return new Promise((resolve) => {
            new timeout_1.Timeout(() => {
                const promise = Promise.all(this.runnableModel.runnables
                    .map(runnable => this.replaceVariables(runnable))
                    .map(runnable => conditional_injector_1.Container.subclassesOf(runner_1.Runner)
                    .create(runnable)
                    .run()
                    .then((report) => {
                    this.report.valid = this.report.valid && report.valid;
                    this.report.runnables.unshift(report);
                })))
                    .then(() => this.report);
                resolve(promise);
            }).start(this.runnableModel.initialDelay || 0);
        });
    }
    replaceVariables(runnable) {
        this.placeHolderReplacer
            .addVariableMap(variables_controller_1.VariablesController.persistedVariables())
            .addVariableMap(variables_controller_1.VariablesController.sessionVariables());
        return this.placeHolderReplacer.replace(runnable);
    }
};
RunnableRunner = __decorate([
    conditional_injector_1.Injectable({ predicate: runnable => runnable.runnables }),
    __metadata("design:paramtypes", [Object])
], RunnableRunner);
exports.RunnableRunner = RunnableRunner;
