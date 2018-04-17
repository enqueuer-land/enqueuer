"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const date_controller_1 = require("../timers/date-controller");
var hash = require('object-hash');
class RequisitionIdGenerator {
    constructor(requisition) {
        this.requisition = requisition;
    }
    generateId() {
        return new date_controller_1.DateController().getStringOnlyNumbers() +
            "_" +
            hash(this.requisition).substr(0, 8);
    }
}
exports.RequisitionIdGenerator = RequisitionIdGenerator;
