"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const date_controller_1 = require("../timers/date-controller");
class RequisitionIdGenerator {
    constructor(requisition) {
        this.requisition = requisition;
    }
    generateId() {
        return "enqueuer_" + this.calculateHash() + "_" + new date_controller_1.DateController().getStringOnlyNumbers() + Math.trunc(Math.random() * 100);
    }
    calculateHash() {
        return Math.abs((this.requisition + '').split("")
            .reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0));
    }
}
exports.RequisitionIdGenerator = RequisitionIdGenerator;
