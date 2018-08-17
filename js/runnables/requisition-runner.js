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
const logger_1 = require("../loggers/logger");
const requisition_reporter_1 = require("../reporters/requisition-reporter");
const input = __importStar(require("../models/inputs/requisition-model"));
const runner_1 = require("./runner");
const conditional_injector_1 = require("conditional-injector");
const json_placeholder_replacer_1 = require("json-placeholder-replacer");
const store_1 = require("../testers/store");
let RequisitionRunner = class RequisitionRunner extends runner_1.Runner {
    constructor(requisition) {
        super();
        const placeHolderReplacer = new json_placeholder_replacer_1.JsonPlaceholderReplacer();
        logger_1.Logger.debug(`Updating replaceable variables in requisition '${requisition.name}'`);
        const replacedRequisition = placeHolderReplacer.addVariableMap(store_1.Store.getData())
            .replace(requisition);
        this.requisitionName = replacedRequisition.name;
        this.requisitionReporter = new requisition_reporter_1.RequisitionReporter(replacedRequisition);
        logger_1.Logger.info(`Starting requisition '${replacedRequisition.name}'`);
    }
    run() {
        return new Promise((resolve) => {
            return this.requisitionReporter.start(() => {
                logger_1.Logger.info(`Requisition '${this.requisitionName}' is over`);
                resolve(this.requisitionReporter.getReport());
            });
        });
    }
};
RequisitionRunner = __decorate([
    conditional_injector_1.Injectable(),
    __metadata("design:paramtypes", [Object])
], RequisitionRunner);
exports.RequisitionRunner = RequisitionRunner;
