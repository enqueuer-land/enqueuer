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
const start_event_reporter_1 = require("./start-event-reporter");
const subscription_reporter_1 = require("../subscription/subscription-reporter");
const conditional_injector_1 = require("conditional-injector");
const report_model_1 = require("../../models/outputs/report-model");
let StartEventSubscriptionReporter = class StartEventSubscriptionReporter extends start_event_reporter_1.StartEventReporter {
    constructor(startEvent) {
        super();
        this.subscriptionReporter = new subscription_reporter_1.SubscriptionReporter(startEvent.subscription);
    }
    start() {
        return new Promise((resolve, reject) => {
            this.subscriptionReporter.connect()
                .then(() => {
                this.subscriptionReporter
                    .startTimeout(() => resolve());
                this.subscriptionReporter.receiveMessage()
                    .then(() => resolve())
                    .catch(err => reject(err));
            })
                .catch(err => reject(err));
        });
    }
    getReport() {
        let report = this.subscriptionReporter.getReport();
        report.valid = report_model_1.checkValidation(report);
        return {
            subscription: report
        };
    }
};
StartEventSubscriptionReporter = __decorate([
    conditional_injector_1.Injectable({ predicate: (startEvent) => startEvent.subscription != null }),
    __metadata("design:paramtypes", [Object])
], StartEventSubscriptionReporter);
exports.StartEventSubscriptionReporter = StartEventSubscriptionReporter;
