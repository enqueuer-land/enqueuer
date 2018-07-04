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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const conditional_injector_1 = require("conditional-injector");
const result_creator_1 = require("./result-creator");
const prettyjson_1 = __importDefault(require("prettyjson"));
const options = {
    defaultIndentation: 4,
    keysColor: 'white',
    dashColor: 'grey',
    inlineArrays: true
};
let StandardOutputResultCreator = class StandardOutputResultCreator extends result_creator_1.ResultCreator {
    constructor() {
        super();
        this.testCounter = 0;
        this.failedTestNames = [];
        this.report = {
            name: 'StandardOutputResultCreator',
            tests: {},
            valid: true,
            runnables: {}
        };
    }
    addTestSuite(suite) {
        this.report.runnables[suite.name] = suite;
        this.report.valid = this.report.valid && suite.valid;
        this.findRequisitions(suite);
    }
    addError(err) {
        ++this.testCounter;
        this.failedTestNames.push(this.report.name.concat('.').concat(err.toString()));
        this.report.valid = false;
    }
    isValid() {
        return this.report.valid;
    }
    create() {
        console.log(prettyjson_1.default.render(this.report, options));
        console.log(`Tests summary (${this.testCounter - this.failedTestNames.length}/${this.testCounter})`);
        if (this.failedTestNames.length > 0) {
            console.log(`Failing tests:`);
            this.failedTestNames
                .forEach((failingTest) => {
                console.log(`\t${failingTest}`);
            });
        }
    }
    findRequisitions(resultModel) {
        resultModel.runnables.forEach((runnable) => {
            if (runnable.type == "runnable") {
                this.findRequisitions(runnable);
            }
            else if (runnable.type == "requisition") {
                const requisition = runnable;
                this.findTests(requisition, this.report.name.concat(".").concat(requisition.name));
            }
        });
    }
    findTests(requisition, prefix) {
        this.inspectInvalidTests(requisition.tests, prefix);
        requisition.subscriptions.forEach(subscription => this.inspectInvalidTests(subscription.tests, prefix.concat(".").concat(subscription.name)));
        if (requisition.startEvent.subscription) {
            this.inspectInvalidTests(requisition.startEvent.subscription.tests, prefix.concat(".").concat(requisition.startEvent.subscription.name));
        }
        if (requisition.startEvent.publisher) {
            this.inspectInvalidTests(requisition.startEvent.publisher.tests, prefix.concat(".").concat(requisition.startEvent.publisher.name));
        }
    }
    inspectInvalidTests(tests, prefix) {
        this.testCounter += Object.keys(tests).length;
        Object.keys(tests)
            .forEach((key) => {
            if (!tests[key]) {
                this.failedTestNames.push(prefix.concat('.').concat(key));
            }
        });
    }
};
StandardOutputResultCreator = __decorate([
    conditional_injector_1.Injectable(),
    __metadata("design:paramtypes", [])
], StandardOutputResultCreator);
exports.StandardOutputResultCreator = StandardOutputResultCreator;
