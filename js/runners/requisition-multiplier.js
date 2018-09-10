"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../loggers/logger");
const json_placeholder_replacer_1 = require("json-placeholder-replacer");
const store_1 = require("../configurations/store");
class RequisitionMultiplier {
    constructor(requisition) {
        this.requisition = requisition;
    }
    multiply() {
        if (this.requisition.iterations === undefined) {
            return [this.requisition];
        }
        if (!this.requisition.iterations) {
            logger_1.Logger.debug(`No iteration was found`);
            return [];
        }
        const iterations = this.evaluateIterations();
        let requisitions = [];
        for (let x = 0; x < iterations; ++x) {
            const clone = Object.assign({}, this.requisition);
            clone.name = clone.name + ` [${x}]`;
            requisitions = requisitions.concat(clone);
        }
        return requisitions;
    }
    evaluateIterations() {
        const placeHolderReplacer = new json_placeholder_replacer_1.JsonPlaceholderReplacer();
        let iterations = {
            iterations: this.requisition.iterations
        };
        return placeHolderReplacer.addVariableMap(store_1.Store.getData())
            .replace(iterations).iterations || 0;
    }
}
exports.RequisitionMultiplier = RequisitionMultiplier;
